var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var moment = require('moment');
var device = require('./device.js');

// update device status function
function updateDeviceStatus(mac) {
  models.Device.getDeviceByMac(mac, function (device) {
    if (device.dataValues.status === "no connection") {
      device.update({
        status: "running"
      }).then(function (res) {
        if (res) {
          console.log("update device status success");
        } else {
          console.log("update device status fail");
        }
      });
    }
  });
}
// update crop status
function updateCropStatus(cropId){
  models.Crop.getCropById(cropId, function (crop) {
    if (crop.dataValues.status === "pending") {
      crop.update({
        status: "running"
      }).then(function (res) {
        if (res) {
          console.log("update crop status success");
        } else {
          console.log("update crop status fail");
        }
      });
    }
  });
}

// parse data from mqtt message
// ex: 11:22:33:44:55:660400102260070400
function parseReceivedData(message, sensorDataCmdId, sensorDataLength) {
  if (message.length === 28) {
    var mac = message.substr(0, 2)
              + ':' + message.substr(2, 2)
              + ':' + message.substr(4, 2)
              + ':' + message.substr(6, 2)
              + ':' + message.substr(8, 2)
              + ':' + message.substr(10, 2);
    var cmdId = message.substr(12, 2);
    var dataLength = message.substr(14, 4);

    if (cmdId === sensorDataCmdId && dataLength === sensorDataLength) {
      var data = message.substr(18, 10);

      return {
        mac: mac,
        temp: Number(data.substr(0, 2)),
        humidity: Number(data.substr(2, 2)),
        ph: Number(data.substr(4, 1) + '.' + data.substr(5, 1)),
        ppm: Number(data.substr(6, 4))
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
}

// receive data from device and add to database
device.client.on('message', function (topic, message) {

  var data = parseReceivedData(message.toString(), '04', '0010');

  if (data) {
    models.Crop.getNewestRunningCropByDeviceMac(data.mac, function (runningCrop) {

      var newData = {
        ph: data.ph,
        ppm: data.ppm,
        humidity: data.humidity,
        temperature: data.temp
      }

      if (runningCrop && (runningCrop.dataValues.closedate > new Date())) {
        // if there is a running crop, add data to it
        newData.CropId = runningCrop.id;
        models.Data.createData(newData,
          function (res) {
          console.log("add data success to running crop")
        }, function(err){
          console.log("add data running" + err)
        })
      } else {
        // if no running crop, add data to nearest pending crop
        models.Crop.getOldestPendingCropByDeviceMac(data.mac, function (pendingCrop) {
          if (pendingCrop) {
            newData.CropId = pendingCrop.id;

            models.Data.createData(newData,
              function (res) {
              console.log("add data success to pending crop")
              updateDeviceStatus(data.mac);
              updateCropStatus(pendingCrop.id);

            }, function(err){
              console.log("Add data pending " + err)
            })

          } else {
            console.log('No running or pending crop')
          }
        })
      }
    })
  } else {
    console.log("Data is not right !")
  }

});
// ======================== end =================

router.get('/all', user.authenticate(), function (req, res) {

  models.Data.getAllDataByCropId(req.query.cropId, function (result) {
    var dataList = [];

    result.forEach(function (item) {
      dataList.push(item.dataValues);
    })

    res.json({
      success: true,
      data: dataList,
      message: 'Get all data success!'
    });
  })
})

router.get('/newest', user.authenticate(), function (req, res) {
  var cropId = req.query.cropId;

  models.Data.getNewestDataByCropId(cropId, function (result) {
    if (result) {
      res.json({
        success: true,
        data: result.dataValues,
        message: 'Get newest data success !'
      });
    } else {
      res.json({
        success: false,
        message: 'No data'
      });
    }

  });
})

module.exports.router = router;
