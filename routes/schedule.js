var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var mqtt = require('mqtt');
var device = require('./device.js');
var utils = require('../utils/utils');
var jsonfile = require('jsonfile');
var path = require('path');
var fs = require('fs');
// client.on('connect', function(){
//   client.
// })

function timeToMessageString(time) {
  var result = time.replace(/:/g, "");
  return result;
}

function normalizeHundredToString(id) {
  if (id < 10) {
    return '0' + id.toString();
  }
  else {
    return id.toString();
  }
}

function normalizeNumber(number, max) {
  var str = number.toString();
  return str.length < max ? normalizeNumber("0" + str, max) : str;
}

function secondsToHMS(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor(d % 3600 / 60);
  var s = Math.floor(d % 3600 % 60);
  return {
    hours: normalizeNumber(h, 2),
    mins: normalizeNumber(m, 2),
    seconds: normalizeNumber(s, 2)
  }
}



router.put('edit', user.authenticate(), function (req, res) {
  var schedule = req.body;
  models.Schedule.createSchedule(schedule, function () {
    device.client.publish();
  })
})

router.get('/all', user.authenticate(), function (req, res) {
  var cropId = req.query.cropId;

  models.Schedule.getScheduleByCropId(cropId, function (result) {
    var listScheduleSetting = [];
    result.forEach(function (item) {
      listScheduleSetting.push(item);
    })
    res.send({
      success: true,
      data: listScheduleSetting,
      message: "Get all settings successfully!"
    });
  }, function (result) {
    res.send({
      success: false,
      message: "Error: Get all settings!"
    });
  }, models)
})


// router.get('/export', function(req, res){
//   models.Schedule.getScheduleByCropId(req.query.cropId, function (result) {
//     var file = path.join(__dirname, 'exported', 'setting2.json');
//     jsonfile.writeFile(file, result, function(err){
//       if (err){
//         res.send({
//           success: false,
//           message: err
//         });
//       } else {
//         res.download(file, function(){
//         });
//       }
//     })
    
//   }, function (err) {
//     res.send({
//       success: false,
//       message: "Cannot export file!"
//     });
//   }, models)
// })

router.delete('/delete', user.authenticate(), function (req, res) {
  var scheduleId = req.query.scheduleId;
  var cropId = req.query.cropId;
  models.Schedule.deleteScheduleSettingById(scheduleId, function (result) {
    models.Crop.getCropById(cropId, function (crop) {
      if (crop)
      {
        crop.updateSynchronized(false, function () {
          res.send({
            success: true,
            message: "Successfully delete schedule setting!"
          });
        })
      }
      else {
        res.send({
          success: false,
          message: "Cannot get crop to update synchronized!"
        });
      }
    })
  }, function(result){

    res.send({
      success: false,
      message: "Cannot delete schedule setting!"
    });
  });
})

router.get('/sync', user.authenticate(), function (req, res) {
  var cropId = req.query.cropId;
  var mac = req.query.mac;
  var commandId = '02';
  var message = mac.replace(/:/g,"").toUpperCase() + commandId;
  var dataLength = 0;
  var topic = 'device/' + mac + '/esp';
  models.Device.getDeviceByMac(mac, function (deviceItem) {
    if (deviceItem) {
      var query = {
        include: models.Schedule,
      }
      deviceItem.getActuators(query).then(function (actuators) {
        var listStrings = [];
        //actuators.forEach(function(item, index) {
        for (i = 0; i < actuators.length; i++) {
          if (actuators[i].dataValues.Schedules.length > 0) {
            dataLength = dataLength + (2 + 2 + 6 * 4 * actuators[i].dataValues.Schedules.length);
            var string = normalizeNumber(i + 1, 2) + normalizeNumber(actuators[i].dataValues.Schedules.length.toString(), 2);
            //item.dataValues.Schedules.forEach(function(scheduleItem){
            for (j = 0; j < actuators[i].dataValues.Schedules.length; j++) {
              var starttimeString = timeToMessageString(actuators[i].dataValues.Schedules[j].starttime);
              var endtimeString = timeToMessageString(actuators[i].dataValues.Schedules[j].endtime);
              var intervaltimeString = secondsToHMS(actuators[i].dataValues.Schedules[j].intervaltime);
              var delaytimeString = secondsToHMS(actuators[i].dataValues.Schedules[j].delaytime);
              string = string.concat(starttimeString).concat(endtimeString).concat(intervaltimeString.hours + intervaltimeString.mins + intervaltimeString.seconds).concat(delaytimeString.hours + delaytimeString.mins + delaytimeString.seconds);
            }
            listStrings.push(string);
          }
          else {
            break;
          }
        }
        //listStrings.forEach(function(item){
        message = message.concat(normalizeNumber(dataLength, 4));
        for (i = 0; i < listStrings.length; i++) {
          message = message.concat(listStrings[i]);
        }
        device.client.publish(topic, utils.encrypt(message));
        models.Crop.getCropById(cropId, function (crop) {
          if (crop)
          {
            crop.updateSynchronized(true, function () {
              res.json({
                success: true,
                data: message,
                message: "Successfully to synchronized setting with device!"
              })
            })
          }
          else {
            res.send({
              success: false,
              message: "Cannot get crop!"
            });
          }
        })
      })
    }
    else {
      res.json({
        success: false,
        message: "MAC address is not matched with any device on database!"
      })
    }
  })

})

router.post('/add', user.authenticate(), function (req, res) {

  //TODO: format data like numberOfTimeSet_hhmmss(starttime)_hhmmss(endtime)_hhmmss(lasttime)_hhmmss(Delay)
  var scheduleSetting = req.body;
  models.Schedule.getScheduleByCropId(scheduleSetting.CropId, function (result) {
    var isOverlapped = false;
    var newstarttime = new Date('1970-01-01T' + scheduleSetting.starttime + 'Z');
    var newendtime = new Date('1970-01-01T' + scheduleSetting.endtime + 'Z');
    for (i = 0; i < result.length; i++) {
      var itemstarttime = new Date('1970-01-01T' + result[i].starttime + 'Z');
      var itemendtime = new Date('1970-01-01T' + result[i].endtime + 'Z');
      if (result[i].ActuatorId == scheduleSetting.ActuatorId) {
        if (itemstarttime >= newendtime)
          continue;
        else {
          if (itemstarttime <= newstarttime) {
            if (itemendtime > newstarttime) {
              isOverlapped = true;
              break;
            }
            else {
              isOverlapped = false;
              continue;
            }
          }
          else {
            isOverlapped = true;
            break;
          }
        }
      }
    };
    if (isOverlapped) {
      res.send({
        success: false,
        message: "Overlaped new setting time! Please input other time."
      });
    }
    else {
      models.Schedule.createSchedule(scheduleSetting, function (result) {
        if (result)
        {
          models.Crop.getCropById(scheduleSetting.CropId, function (crop) {
            if (crop)
            {
              crop.updateSynchronized(false, function () {
                res.send({
                  success: true,
                  message: "Add setting successfully!"
                });
              })
            }
            else {
              res.send({
                success: false,
                message: "Cannot get crop!"
              });
            }
          })
        }
        else
        {
          res.send({
            success: false,
            message: "Cannot create schedule setting!"
          });
        }
      })
    };
  }, function (result) {
    res.send({
      success: false,
      message: "Error when get all settings!"
    });
  }, models);


})

module.exports.router = router;
