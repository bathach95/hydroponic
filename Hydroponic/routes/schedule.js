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
    //res.json({

    //});
    res.send({
      watering: watering,
      fan: fan,
      lighting: lighting,
      oxygen: oxygen
    });

  });
})

module.exports.router = router;
