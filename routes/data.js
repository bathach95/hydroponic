var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

var device = require('./device.js');

// update device status function
function updateDeviceStatus(mac) {
  models.Device.getDeviceByMac(mac, function(device) {
    if (device.dataValues.status === "no connection") {
      device.update({
        status: "running"
      }).then(function(res) {
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
  models.Data.createData(newData, function(res) {
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

// receive data from device and add to database
device.client.on('message', function(topic, message) {

  try {
    var data = JSON.parse(message.toString());
    console.log(data);
    var ackTopic = 'device/' + data.mac + '/esp';

    if (data.type === "sensor_data") {

      models.Crop.getNewestCropByDeviceMac(data.mac, function(crop) {
        if (crop) {

          var newData = {
            CropId: crop.dataValues.id,
            temperature: data.temp,
            humidity: data.hum,
            ppm: data.ppm,
            ph: data.ph
          }
          createNewData(newData, data.mac, ackTopic);

        } else {
          //====== send ack ======
          var ackData = {
            mac: data.mac,
            type: 'ack',
            message: 'fail'
          }
          device.client.publish(ackTopic, JSON.stringify(ackData));
          // ====== end send ack ======
        }

      })

    } else {
      console.log(data);
    }
  } catch(err){
    console.log(err);
  }


});
// ======================== end =================

router.get('/all', user.authenticate(), function(req, res) {
  var cropId = req.query.cropId;

  models.Data.getAllDataByCropId(cropId, function(result) {
    res.send(result);
  })
})

router.get('/newest', user.authenticate(), function(req, res) {
  var cropId = req.query.cropId;

  models.Data.getNewestDataByCropId(cropId, function(result) {
    res.send(result);
  });
})

module.exports.router = router;
