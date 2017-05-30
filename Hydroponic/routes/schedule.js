var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://broker.hivemq.com');

// client.on('connect', function(){
//   client.
// })

router.put('edit', user.authenticate(), function(req, res){
  var schedule = req.body;
  models.Schedule.createSchedule(schedule, function () {
    client.publish();
  })
})

router.get('/all', user.authenticate(), function(req, res){
  var cropId = req.query.cropId;
  models.Schedule.getScheduleByCropId(cropId, function(result){
    res.send(result);
  })
})

module.exports.router = router;
