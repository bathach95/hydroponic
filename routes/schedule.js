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
  console.log(cropId);
  models.Schedule.getScheduleByCropId(cropId, function(result){
    /*var watering = [];
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

      }*/
      var listScheduleSetting = [];
      result.forEach(function(item){
        listScheduleSetting.push(item);
      })
      res.send({
        success: true,
        data: listScheduleSetting,
        message: "Get all settings successfully!"
      });
    }, function(result){
      res.send({
        success: false,
        message: "Error: Get all settings!"
      });
    }, models)
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

  //TODO: format data like numberOfTimeSet_hhmmss(starttime)_hhmmss(endtime)_hhmmss(lasttime)_hhmmss(Delay)
  // encrypt data before sending
  var scheduleSetting = req.body;
  console.log(scheduleSetting);
  models.Schedule.getScheduleByCropId(scheduleSetting.CropId, function(result){
    console.log("It's ok!");
    var isOverlapped = false;
    var newstarttime = new Date('1970-01-01T' + scheduleSetting.starttime + 'Z');
    var newendtime = new Date('1970-01-01T' + scheduleSetting.endtime + 'Z');
    for (i = 0; i < result.length; i++)
    {
      var itemstarttime = new Date('1970-01-01T' + result[i].starttime + 'Z');
      var itemendtime = new Date('1970-01-01T' + result[i].endtime + 'Z');
      if (result[i].ActuatorId == scheduleSetting.ActuatorId)
      {
        if (itemstarttime >= newendtime)
          continue;
        else
        {
          if (itemstarttime <= newstarttime)
          {
            if (itemendtime > newstarttime)
            {
              isOverlapped = true;
              break;
            }
            else
            {
              isOverlapped = false;
              continue;
            }
          }
          else
          {
            isOverlapped = true;
            break;
          }
        }
      }
    };
    if (isOverlapped)
    {
      res.send({
        success: false,
        message: "Overlaped new setting time! Please input other time."
      });
    }
    else {
      models.Schedule.createSchedule(scheduleSetting, function(result){
        res.send({
          success:true,
          message:"Add setting successfully!"
        });
      })
    };
  }, function(result){
    res.send({
      success: false,
      message: "Error when get all settings!"
    });
  }, models);

/*
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
  });*/

  // models.Schedule.createSchedule(listScheduleSetting.cropId, function(result){
  //   console.log("Successfully delete all schedule with crop Id!");
  // });
})

module.exports.router = router;
