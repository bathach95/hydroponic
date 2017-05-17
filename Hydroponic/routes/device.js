var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

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
    function(result){
      if (result){
        res.json({
          success: false,
          message: "Device has already existed"
        });
      } else {
        models.Device.createDevice(newDevice,
          function() {
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
    function(err){
      res.json({
        success: false,
        message: err
      });
    }
  )

});

router.post('/delete', user.authenticate(), function(req, res) {
  models.Device.deleteDevice(req.body.mac, function(success){
    if (success){
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

module.exports.router = router;
