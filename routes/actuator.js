var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
//====== auto query mac from database and subscribe to that chanel =======

//================================ end ===================================
router.post('/addactuator', user.authenticate(), function(req, res) {
  var newActuator = req.body.actuator;
  newActuator.DeviceMac = req.body.devicemac;
  console.log(newActuator);
  models.Actuator.createActuator(newActuator, function() {
    res.json({
      success: true,
      message: "Add actuator success"
    });
  },
  function (err) {
    res.json({
      success: false,
      message: err
    });
  })
});

router.get('/all', user.authenticate(), function(req, res){
  var mac = req.query.mac;

  models.Device.getDeviceByMac(mac, function(device){
    if (device)
    {
      device.getActuators().then(function(actuators){
        var listActuators = [];
        actuators.forEach(function(item) {
          listActuators.push(item.dataValues);
        })
        res.json({
          success:true,
          data: listActuators,
          message: "Successfully to get all actuators!"
        })
      })
    }
    else {
      res.json({
        success:false,
        message: "MAC address is not matched with any device on database!"
      })
    }
  })
  /*
  models.Actuator.getActuatorsByMac(mac,
    function (result) {
      console.log(111222);
      console.log(device.dataValues);
      res.json({
        success:true,
        data: result.dataValues,
        message: "Successfully!"
      })
    },
    function (err) {
      console.log(444);
      res.json({
        success:false,
        message: err
      });
    }
  );*/
})

module.exports.router = router;
