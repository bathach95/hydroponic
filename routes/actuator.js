var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var device = require('./device.js');
//====== auto query mac from database and subscribe to that chanel =======

//================================ end ===================================
router.post('/addactuator', user.authenticate(), function(req, res) {
  var newActuator = req.body.actuator;
  newActuator.DeviceMac = req.body.devicemac;
  models.Actuator.createActuator(newActuator, function() {
    var topic = "device/" + req.body.devicemac + "/esp";
    var priority;
    if (newActuator.priority == 'Primary')
    {
      priority = '0';
    }
    else {
      priority = '1';
    }
    var message = req.body.devicemac + '06' + '0004' + '0' + priority;
    device.client.publish(topic, message);
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

router.put('/status', user.authenticate(), function(req, res) {
  models.Actuator.getActuatorById(req.body.id, function(actuator){
    actuator.updateStatus(req.body.status, function() {
      var topic = "device/" + req.body.mac + "/esp";
      var status;
      if (req.body.status == 'on')
      {
        status = '1';
      }
      else {
        status = '0';
      }
      var message = req.body.mac + '03' + '0003' + req.body.actuatorid.toString() + status;
      device.client.publish(topic, message);
      res.json({
        success: true,
        message: 'Update actuator status successfully!'
      })
    }, function(){
      res.json({
        success: false,
        message: 'Something wrong: Cannot update actuator status!'
      })
    })
  }, function(result){
    res.json({
      success: false,
      message: 'Error when getting actuator!'
    })
  })
})

module.exports.router = router;
