var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

router.get('/all', user.authenticate(), function(req, res){
  var userEmail = req.query.email;
  models.Device.getDevicesByUserEmail(userEmail,
    function(result){
      var deviceList = [];
      result.forEach(function(item, index){
        deviceList.push(item.dataValues);
      });
      res.send(deviceList);
    },
    function(err){
      res.send(err);
    }
  );
})

router.get('/one', user.authenticate(), function(req, res){
    var mac = req.query.mac;

    models.Device.getDeviceByMac(mac,
      function(result){
        res.send(result);
      },
      function(err){
        res.send(err);
      }
    );
})

module.exports.router = router;
