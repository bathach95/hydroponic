var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var device = require('./device.js');
var FCM = require('fcm-node');

// notify to mobile phone
var serverKey = 'AIzaSyD0XtvqNAw6kTO34Ot50WsJkQF568kDuR4';
var fcm = new FCM(serverKey);

router.get('/testpush', function (req, res) {
  var message = {
    to: '/topics/112233445566',
    data: {
      dataKey: 'your_custom_data_value'
    },
    notification: {
      title: 'BKHydroponic',
      body: 'heheehehehehe',
      sound: 'default',
    }
  };


  //callback style
  fcm.send(message, function (err, response) {
    if (err) {
      res.send(err);
    } else {
      res.send("Successfully sent with response: " + response);
    }
  });
})
// update device status function
function updateDeviceStatus(mac) {
  models.Device.getDeviceByMac(mac, function (device) {
    if (device.dataValues.status === "no connection") {
      device.update({
        status: "running"
      }).then(function (res) {
        if (res) {
          console.log("update success");
        } else {
          console.log("update fail");
        }
      });
    }
  });
}

// add new data to table
function createNewData(newData, mac, ackTopic) {
  models.Data.createData(newData, function (res) {
    //========== send ack ===========

    var ackData = {
      mac: mac,
      type: 'ack',
      message: 'success'
    }
    device.client.publish(ackTopic, JSON.stringify(ackData));
    //=========== end send ack =========

    //=========== update status of device ========
    updateDeviceStatus(mac);
    //========== end update status of device ============
  });
}

// parse data from mqtt message
function parseData(message, cmdId, dataLength) {
  if (message.length === 33) {
    var mac = message.substr(0, 17);
    var dataCmdId = message.substr(17, 2);
    var dataDataLength = message.substr(19, 4);

    if (cmdId === dataCmdId && dataLength === dataDataLength) {
      var data = message.substr(23, dataLength);

      return {
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
// Ex: 11:22:33:44:55:660400102260070400
device.client.on('message', function (topic, message) {

  var dataString = message.toString();

  // get data if it is sensor data messsage
  var data = parseData(dataString, '04', '0010');

  if (data){
    // add to database
      models.Crop.getNewestCropByDeviceMac(data.mac, function (crop) {
        if (crop) {

          var newData = {
            CropId: crop.dataValues.id,
            temperature: data.temp,
            humidity: data.hum,
            ppm: data.ppm,
            ph: data.ph
          }
          // TODO: add to database
          // createNewData(newData, data.mac, ackTopic);
        } 

      })
  }


  // try {
  //   var data = JSON.parse(message.toString());
  //   console.log(data);
  //   var ackTopic = 'device/' + data.mac + '/esp';

  //   if (data.type === "sensor_data") {

  //     models.Crop.getNewestCropByDeviceMac(data.mac, function (crop) {
  //       if (crop) {

  //         var newData = {
  //           CropId: crop.dataValues.id,
  //           temperature: data.temp,
  //           humidity: data.hum,
  //           ppm: data.ppm,
  //           ph: data.ph
  //         }
  //         createNewData(newData, data.mac, ackTopic);

  //       } else {
  //         //====== send ack ======
  //         var ackData = {
  //           mac: data.mac,
  //           type: 'ack',
  //           message: 'fail'
  //         }
  //         device.client.publish(ackTopic, JSON.stringify(ackData));
  //         // ====== end send ack ======
  //       }

  //     })

  //   } else {
  //     console.log(data);
  //   }
  // } catch (err) {
  //   console.log(err);
  // }


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
        message: 'Get data success !'
      });
    } else {
      res.json({
        success: false,
        message: 'No data'
      })
    }

  });
})

module.exports.router = router;
