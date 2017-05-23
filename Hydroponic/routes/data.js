var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

var device = require('./device.js');

// receive data from device and add to database
device.client.on('message', function(topic, message) {
  var data = JSON.parse(message);
  if (data.type === "sensor_data") {

    models.Crop.getNewestCropByDeviceMac(data.mac, function(crop) {

      var newData = {
        CropId: crop.dataValues.id,
        temperature: data.temp,
        humidity: data.humidity,
        ppm: data.ppm,
        ph: data.ph
      }

      models.Data.createData(newData, function(res){
        // send ack
        var ackTopic = 'device/' + data.mac + '/ack';
        var ackData = {
          mac: data.mac,
          type: 'ack',
          message: 'success'
        }
        device.client.publish(ackTopic, JSON.stringify(ackData));
      })

    })
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
