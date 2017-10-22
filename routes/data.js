var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var moment = require('moment');
var device = require('./device.js');
var FCM = require('fcm-node');
var utils = require('./utils');
var serverKey = 'AIzaSyD0XtvqNAw6kTO34Ot50WsJkQF568kDuR4';
var fcm = new FCM(serverKey);

// send notify to mobile
function sendNotifyToMobile(topicMac, type) {
  var message = {
    to: '/topics/' + topicMac,
    notification: {
      title: 'BK Hydroponic',
      body: 'Your system is having problem with ' + type
    }
  };

  fcm.send(message, function (err, response) {
    if (err) {
      console.log("Notify err: " + err)
    } else {
      console.log("Notify sucess: " + response);
    }
  });
}

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
function updateCropStatus(cropId) {
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
// ex: 1122334455660400102260070400
function parseReceivedData(message, sensorDataCmdId, sensorDataLength) {
  if (message.length === 28) {
    var mac = message.substr(0, 12);
    var cmdId = message.substr(12, 2);
    var dataLength = message.substr(14, 4);

    if (cmdId === sensorDataCmdId && dataLength === sensorDataLength) {
      var data = message.substr(18, 10);

      return {
        mac: mac,
        temp: Number(data.substr(0, 2)),
        humidity: Number(data.substr(2, 2)),
        ph: Number(data.substr(4, 2)),
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
        newData.CropId = runningCrop.id;

        models.Data.getNewestDataByCropId(runningCrop.id, function (oldData) {

          // if there is a running crop, add data to it
          models.Data.createData(newData,
            function (res) {
              console.log("add data success to running crop")
            }, function (err) {
              console.log("add data running" + err)
            })

          if (oldData) {
            models.Threshold.getNewestThresholdByCropId(runningCrop.id, function (threshold) {
              var oldDataStatus = utils.getDataStatus(oldData, threshold);
              var newDataStatus = utils.getDataStatus(newData, threshold);

              if (oldDataStatus.status && newDataStatus.status) {
                var notifyStatus = {
                  temp: oldDataStatus.badStatus.temp && newDataStatus.badStatus.temp,
                  humidity: oldDataStatus.badStatus.humidity && newDataStatus.badStatus.humidity,
                  ph: oldDataStatus.badStatus.ph && newDataStatus.badStatus.ph,
                  ppm: oldDataStatus.badStatus.ppm && newDataStatus.badStatus.ppm
                }

                if (notifyStatus.temp) {
                  sendNotifyToMobile(data.mac, "temperature");
                }

                if (notifyStatus.humidity) {
                  sendNotifyToMobile(data.mac, "humidity");
                }

                if (notifyStatus.ph) {
                  sendNotifyToMobile(data.mac, "ph");
                }

                if (notifyStatus.ppm) {
                  sendNotifyToMobile(data.mac, "ppm");
                }
              }

            })
          }
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

              }, function (err) {
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
