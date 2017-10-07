var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://test.mosquitto.org');

//====== auto query mac from database and subscribe to that chanel =======

models.Device.findAll({
  attributes: ['mac']
}).then(function(result){
  result.forEach(function(item){
    var topic = 'device/' + item.dataValues.mac + '/server';
    client.subscribe(topic, function(){
      console.log("subscribe success to " + topic);
    });
  });
})

//================================ end ===================================

router.get('/all', user.authenticate(), function(req, res) {

  var userEmail = req.query.email;
  models.Device.getDevicesByUserEmail(userEmail,
    function(result) {
      var deviceList = [];
      result.forEach(function(item, index) {
        deviceList.push(item.dataValues);
      });
      res.send(deviceList);
    },
    function(err) {
      res.send(err);
    }
  );


})

router.get('/one', user.authenticate(), function(req, res) {
  var mac = req.query.mac;

  models.Device.getDeviceByMac(mac,
    function(result) {
      res.send(result);
    },
    function(err) {
      res.send(err);
    }
  );
})

router.post('/add', user.authenticate(), function(req, res) {
  var newDevice = req.body;

  models.Device.getDeviceByMac(newDevice.mac,
    function(result) {
      if (result) {
        res.json({
          success: false,
          message: "Device has already existed"
        });
      } else {
        models.Device.createDevice(newDevice,
          function() {

            // this topic is for send and receive data
            var topic = 'device/' + newDevice.mac + '/server'

            client.subscribe(topic, function() {
              console.log("subscribe success after add new device");
            });

            res.json({
              success: true,
              message: "Add device success"
            });

          },
          function(err) {
            res.json({
              success: false,
              message: err
            });
          }
        );
      }
    },
    function(err) {
      res.json({
        success: false,
        message: err
      });
    }
  )

});

router.delete('/delete', user.authenticate(), function(req, res) {
  models.Device.deleteDevice(req.query.mac, function(success) {
    if (success) {
      res.send({
        success: true,
        message: "Device is deleted"
      });
    } else {
      res.send({
        success: false,
        message: "Device is not deleted"
      });
    }

  });
});

module.exports.client = client;
module.exports.router = router;
