var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var mqtt = require('mqtt');
var device = require('./device.js');


// client.on('connect', function(){
//   client.
// })

router.put('edit', user.authenticate(), function(req, res){
  var schedule = req.body;
  models.Schedule.createSchedule(schedule, function () {
    device.client.publish();
  })
})

router.get('/all', user.authenticate(), function(req, res){
  var cropId = req.query.cropId;

  models.Schedule.getScheduleByCropId(cropId, function(result){
    var watering = [];
    var fan = [];
    var lighting = [];
    var oxygen = [];
    result.forEach(function(item, index){
      switch (item.dataValues.type) {
        case 'watering':
          watering.push(item.dataValues);
          break;
        case 'fan':
          fan.push(item.dataValues);
          break;
        case 'lighting':
          lighting.push(item.dataValues);
          break;
        case 'oxygen':
          oxygen.push(item.dataValues);
          break;
        default:

      }
    })

    res.send({
      watering: watering,
      fan: fan,
      lighting: lighting,
      oxygen: oxygen
    });

  });
})

router.delete('/delete', user.authenticate(), function(req, res){
  var cropId = req.query.cropId;

  models.Schedule.deleteScheduleByCropId(cropId, function(result){
    console.log("Successfully delete all schedule with crop Id!");
    res.send({
      success:true
    });
  });
})

router.post('/add', user.authenticate(), function(req, res){
  var listScheduleSetting = req.body;

  listScheduleSetting.watering.forEach(function(item, index){
    models.Schedule.createSchedule(item, function(result){
    });
  });
  listScheduleSetting.fan.forEach(function(item, index){
    models.Schedule.createSchedule(item, function(result){
    });
  });
  listScheduleSetting.lighting.forEach(function(item, index){
    models.Schedule.createSchedule(item, function(result){
    });
  });
  listScheduleSetting.oxygen.forEach(function(item, index){
    models.Schedule.createSchedule(item, function(result){
    });
  });
  res.send({
    success:true
  });
  // models.Schedule.createSchedule(listScheduleSetting.cropId, function(result){
  //   console.log("Successfully delete all schedule with crop Id!");
  // });
})

module.exports.router = router;
