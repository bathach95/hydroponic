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
var moment = require('moment');
var parseMqttMsgUtils = require('../utils/parseMqttMsgUtils');
var protocolConstant = require('../utils/protocolConstant');

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

router.get('/searchall', function (req, res) {
  var cropId = req.query.cropId;

  models.Crop.getCropById(cropId, function (result) {
    if (result.dataValues.share) {
      result.getSchedules({include: models.Actuator}).then(function (schedules) {
        var listScheduleSetting = [];
        schedules.forEach(function (item) {
          listScheduleSetting.push(item);
        })
        res.send({
          success: true,
          data: listScheduleSetting,
          message: "Get all settings successfully!"
        });
      })
    }
    else {
      res.send({
        success: false,
        message: "This crop is not shared!"
      });
    }
  }, function (result) {
    res.send({
      success: false,
      message: "Error when getting crop info!"
    });
  })
})


router.delete('/delete', user.authenticate(), function (req, res) {
  var scheduleId = req.query.scheduleId;
  var cropId = req.query.cropId;
  models.Schedule.deleteScheduleSettingById(scheduleId, function (result) {
    models.Crop.getCropById(cropId, function (crop) {
      if (crop) {
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
  }, function (result) {

    res.send({
      success: false,
      message: "Cannot delete schedule setting!"
    });
  });
})

router.get('/sync', user.authenticate(), function (req, res) {
  var deviceMac = req.query.mac;
  var deviceTopic = utils.getDeviceTopic(deviceMac);
  var serverTopic = utils.getServerTopic(deviceMac);
  const client = mqtt.connect(protocolConstant.MQTT_BROKER);
  var cropId = req.query.cropId;
  var commandId = '02';
  var message = deviceMac.replace(/:/g, "").toUpperCase() + commandId;
  var dataLength = 0;
  //var topic = 'device/' + mac + '/esp';
  var numOfActuatorsWithSchedules = 0;
  models.Device.getDeviceByMac(deviceMac, function (deviceItem) {
    if (deviceItem) {
      var query = {
        include: models.Schedule,
        order: [[models.Schedule, 'starttime', 'ASC']]
      }
      deviceItem.getActuators(query).then(function (actuators) {
        var listStrings = [];
        //actuators.forEach(function(item, index) {
        for (i = 0; i < actuators.length; i++) {
          if (actuators[i].dataValues.Schedules.length > 0) {
            numOfActuatorsWithSchedules = numOfActuatorsWithSchedules + 1;
            dataLength = dataLength + (2 + 2 + 6 * 4 * actuators[i].dataValues.Schedules.length);
            //var string = utils.normalizeNumber(i + 1, 2) + utils.normalizeNumber(actuators[i].dataValues.Schedules.length.toString(), 2);
            var string = actuators[i].idonboard + utils.normalizeNumber(actuators[i].dataValues.Schedules.length.toString(), 2);
            //item.dataValues.Schedules.forEach(function(scheduleItem){
            for (j = 0; j < actuators[i].dataValues.Schedules.length; j++) {
              var starttimeString = utils.timeToMessageString(actuators[i].dataValues.Schedules[j].starttime);
              var endtimeString = utils.timeToMessageString(actuators[i].dataValues.Schedules[j].endtime);
              var intervaltimeString = utils.secondsToHMS(actuators[i].dataValues.Schedules[j].intervaltime);
              var delaytimeString = utils.secondsToHMS(actuators[i].dataValues.Schedules[j].delaytime);
              string = string.concat(starttimeString).concat(endtimeString).concat(intervaltimeString.hours + intervaltimeString.mins + intervaltimeString.seconds).concat(delaytimeString.hours + delaytimeString.mins + delaytimeString.seconds);
            }
            listStrings.push(string);
          }
          else {
            break;
          }
        }
        //listStrings.forEach(function(item){
        message = message.concat(utils.normalizeNumber(dataLength + 2, 4));
        message = message.concat(utils.normalizeNumber(numOfActuatorsWithSchedules, 2))
        for (i = 0; i < listStrings.length; i++) {
          message = message.concat(listStrings[i]);
        }
        console.log(message);
        // subscribe to server topic to get ACK package from device
        client.subscribe(serverTopic, function () {
          console.log('this line subscribe success to ' + serverTopic)
        })
        // send update status message to device
        client.publish(deviceTopic, utils.encrypt(message), function (err) {
          if (err) {
            console.log(err);
            utils.log.err(err);
            client.end(false, function () {
              res.json({
                success: false,
                message: 'Cannot send settings to device.'
              })
            })

          } else {
            // wait for ack message from device
            client.on('message', function (topic, payload) {
              var ack = parseMqttMsgUtils.parseAckMsg(utils.decrypt(payload));
              if (ack) {
                if (ack.mac === deviceMac && ack.data === protocolConstant.ACK.HANDLED) {
                  client.end();
                  models.Crop.getCropById(cropId, function (crop) {
                    if (crop) {
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
                } else {
                  res.json({
                    success: false,
                    message: 'Cannot send settings to device.'
                  })
                }
              }
            })
          }
        });
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
  var scheduleSetting = req.body;
  if (scheduleSetting.starttime >= scheduleSetting.endtime) {
    res.json({
      success: false,
      message: "start time must before end time"
    })
  } else {

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
          if (result) {
            models.Crop.getCropById(scheduleSetting.CropId, function (crop) {
              if (crop) {
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
          else {
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
  }
})

module.exports.router = router;
