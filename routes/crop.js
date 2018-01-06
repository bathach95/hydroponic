var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var device = require('./device.js');
var utils = require('../utils/utils');
const mqtt = require('mqtt');
var parseMqttMsgUtils = require('../utils/parseMqttMsgUtils');
var protocolConstant = require('../utils/protocolConstant');
var moment = require('moment');

router.get('/all', user.authenticate(), function (req, res) {
  var mac = req.query.mac;
  models.Device.getDeviceByMac(mac, function (device) {
    if (device) {
      device.getCrops({ order: [['createdAt', 'DESC']] }).then(function (result) {
        var cropList = [];

        result.forEach(function (item) {
          var crop = item.dataValues;
          var today = new Date();
          if (crop.startdate > today){
            crop.status = "pending";
          } else if (crop.startdate <= today && today <= crop.closedate){
            crop.status = "running";
          } else {
            crop.status = "end";
          }
          cropList.push(crop);
        })

        res.json({
          success: true,
          data: cropList,
          message: 'Get all crop success!'
        });
      })
    } else {
      res.json({
        success: false,
        message: 'Device does not exist!'
      })
    }
  })
})

router.get('/one', user.authenticate(), function (req, res) {

  models.Crop.getCropById(req.query.id, function (result) {
    if (result) {
      res.json({
        success: true,
        data: result.dataValues,
        message: 'Get crop success !'
      })
    } else {
      res.json({
        success: false,
        message: 'Crop does not exist !'
      })
    }
  })
})

router.get('/searchdetail', function (req, res) {

  models.Crop.getSearchCropById(req.query.id, function (result) {
    if (result) {
      if (result.dataValues.share) {
        res.json({
          success: true,
          data: result.dataValues,
          message: 'Get crop success !'
        })
      }
      else {
        res.json({
          success: false,
          message: 'This crop is not shared !'
        })
      }
    } else {
      res.json({
        success: false,
        message: 'Crop does not exist !'
      })
    }
  }, function () {
    res.json({
      success: false,
      message: 'Error when getting crop !'
    })
  })
})

router.post('/sendreview', user.authenticate(), function (req, res) {
  var review = {
    content: req.body.content,
    rating: req.body.rating,
    UserId: req.user.id,
    CropId: req.body.CropId
  }
  console.log(review);
  models.Review.createReview(review, function (result) {
    console.log(result);
    if (result) {
      res.json({
        success: true,
        message: 'Send review success !'
      })
    } else {
      res.json({
        success: false,
        message: 'Error when sending review !'
      })
    }
  })
})

router.get('/newest', user.authenticate(), function (req, res) {

  models.Crop.getNewestRunningCropByDeviceMac(req.query.mac,
    function (result) {
      if (result) {
        res.json({
          success: true,
          data: result.dataValues,
          message: 'Get crop success !'
        })
      } else {
        res.json({
          success: false,
          message: 'Crop does not exist !'
        })
      }
    }, function (err) {
      utils.log.error(err);
      res.json({
        success: false,
        message: 'Error when get crop'
      })
    })
})

router.post('/add', user.authenticate(), function (req, res) {

  // check crop name already exist
  models.Crop.getCropByName(req.body.name, req.body.DeviceMac, function (result) {
    if (result) {
      res.json({
        success: false,
        message: "Crop name has already existed."
      });
    } else {

      models.Crop.getNewestRunningCropByDeviceMac(req.body.DeviceMac, function (runningCrop) {

        if (runningCrop) {
          res.json({
            success: false,
            message: "There is a current running crop. You cannot add more. This feature is in development"
          });
        } else {

          models.Crop.getOldestPendingCropByDeviceMac(req.body.DeviceMac, function (pendingCrop) {

            if (pendingCrop) {
              res.json({
                success: false,
                message: "There is a current pending crop. You cannot add more. This feature is in development"
              });
            } else {

              var deviceMac = req.body.DeviceMac.toUpperCase();
              var deviceTopic = utils.getDeviceTopic(deviceMac);
              var serverTopic = utils.getServerTopic(deviceMac);
              const client = mqtt.connect(protocolConstant.MQTT_BROKER);
              var parseTimeFormat = "MM/DD/YYYY HH:mm A";
              var sendTimeFormat = "YYYYMMDDHHmmss";

              var reporttime = utils.secondsToHMS(req.body.reporttime);
              var message = deviceMac.replace(/:/g, "") + '01' + '0034'
                + moment(req.body.startdate, parseTimeFormat).format(sendTimeFormat)
                + moment(req.body.closedate, parseTimeFormat).format(sendTimeFormat)
                + reporttime.hours + reporttime.mins + reporttime.seconds;

              // subscribe to server topic to get ACK package from device
              client.subscribe(serverTopic, function () {
                console.log('this line subscribe success to ' + serverTopic)
              })
              // send update status message to device
              client.publish(deviceTopic, utils.encrypt(message), protocolConstant.MQTT_OPTIONS, function (err) {
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
                        var newCrop = req.body;
                        newCrop.startdate = moment(req.body.startdate, parseTimeFormat).utcOffset(protocolConstant.TIME_ZONE)
                        newCrop.closedate = moment(req.body.closedate, parseTimeFormat).utcOffset(protocolConstant.TIME_ZONE)
                        models.Crop.createCrop(newCrop, function () {
                          res.json({
                            success: true,
                            message: "Add crop success"
                          })
                        });
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


            }

          })

        }

      }, function(err){
        utils.log.error(err);
        res.json({
          success: false,
          message: "Error when get running crop"
        })
      })

    }
  });

})

router.delete('/delete', user.authenticate(), function (req, res) {

  models.Crop.getCropById(req.query.id, function (crop) {

    var deviceMac = crop.dataValues.DeviceMac.toUpperCase();
    var deviceTopic = utils.getDeviceTopic(deviceMac);
    var serverTopic = utils.getServerTopic(deviceMac);
    const newClient = mqtt.connect(protocolConstant.MQTT_BROKER);

    var timeFormat = "MM/DD/YYYY HH:mm A";
    var timeSendFormat = "YYYYMMDDHHmmss";
    var reportInterval = 0;

    var reporttime = utils.secondsToHMS(reportInterval);
    var message = deviceMac.replace(/:/g, "") + '01' + '0034'
      + moment(new Date(), timeFormat).format(timeSendFormat)
      + moment(new Date(), timeFormat).format(timeSendFormat)
      + reporttime.hours + reporttime.mins + reporttime.seconds;

    newClient.subscribe(serverTopic, function () {
      console.log("subscribe success to delete device")
    })

    newClient.publish(deviceTopic, utils.encrypt(message), protocolConstant.MQTT_OPTIONS, function (err) {
      if (err) {
        console.log(err);
        utils.log.err(err);
        newClient.end(false, function () {
          res.json({
            success: false,
            message: 'Cannot send delete message to device.'
          })
        })
      } else {

        newClient.on('message', function (topic, payload) {
          var ack = parseMqttMsgUtils.parseAckMsg(utils.decrypt(payload));
          if (ack && ack.mac === deviceMac) {
            // newClient.end();
            // [8C2C15E83A2C][02][0002][00]
            if (ack.data === protocolConstant.ACK.HANDLED) {
              // send package to delete schedule
              var deleteScheduleMsg = deviceMac.replace(/:/g, "") + '02' + '0002' + '00';
              newClient.publish(deviceTopic, utils.encrypt(deleteScheduleMsg), protocolConstant.MQTT_OPTIONS, function (err) {
                if (err) {
                  console.log(err);
                  utils.log.error(err);
                  newClient.end(false, function () {
                    res.json({
                      success: false,
                      message: 'Cannot send delete schedule to device.'
                    })
                  })
                } else {
                  newClient.on('message', function (topic, payload) {
                    var ack = parseMqttMsgUtils.parseAckMsg(utils.decrypt(payload));
                    if (ack && ack.mac === deviceMac) {
                      newClient.end();
                      if (ack.data === protocolConstant.ACK.HANDLED) {
                        models.Crop.deleteCrop(req.query.id, function (success) {
                          if (success) {
                            res.send({
                              success: true,
                              message: "Crop is deleted"
                            });
                          } else {
                            res.send({
                              success: false,
                              message: "Crop is not deleted"
                            });
                          }
                        });
                      } else {
                        res.json({
                          success: false,
                          message: 'Device cannot handle delete schedule message.'
                        })
                      }
                    }
                  })
                }
              })
            } else {
              res.json({
                success: false,
                message: 'Device cannot handle delete crop message.'
              })
            }
          }
        })

      }
    })
  })
})

router.put('/edit', user.authenticate(), function (req, res) {
  models.Crop.getCropById(req.body.id, function (result) {
    if (!result) {
      res.json({
        success: false,
        message: 'Crop is not existed.'
      })
    }
    else {
      var deviceMac = req.body.DeviceMac.toUpperCase();
      var deviceTopic = utils.getDeviceTopic(deviceMac);
      var serverTopic = utils.getServerTopic(deviceMac);
      const client = mqtt.connect(protocolConstant.MQTT_BROKER);
      var timeFormat = "MM/DD/YYYY HH:mm A";
      var timeSendFormat = "YYYYMMDDHHmmss";

      var reporttime = utils.secondsToHMS(req.body.reporttime);
      var message = deviceMac.replace(/:/g, "") + '01' + '0034'
        + moment(req.body.startdate, timeFormat).format(timeSendFormat)
        + moment(req.body.closedate, timeFormat).format(timeSendFormat)
        + reporttime.hours + reporttime.mins + reporttime.seconds;

      // subscribe to server topic to get ACK package from device
      client.subscribe(serverTopic, function () {
        console.log('this line subscribe success to ' + serverTopic)
      })
      // send update status message to device
      client.publish(deviceTopic, utils.encrypt(message), protocolConstant.MQTT_OPTIONS, function (err) {
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
                result.update({
                  name: req.body.name,
                  treetype: req.body.treetype,
                  startdate: moment(req.body.startdate, timeFormat),
                  closedate: moment(req.body.closedate, timeFormat),
                  reporttime: req.body.reporttime,
                  type: req.body.type
                }).then(function () {
                  res.json({
                    success: true,
                    message: "Edit crop success"
                  })
                }).catch(function (err) {
                  console.log(err)
                  res.json({
                    success: false,
                    message: "Cannot update crop to database"
                  })
                });
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
    }
  });
})

router.put('/share', user.authenticate(), function (req, res) {
  models.Crop.getCropById(req.body.id, function (crop) {
    if (crop) {
      crop.updateShare(req.body.share, function () {
        res.json({
          success: true,
          message: 'Update share status success !'
        })
      })
    } else {
      res.json({
        success: false,
        message: 'Crop does not exist !'
      })
    }
  })
})

router.get('/search', function (req, res) {
  if (req.query.type === 'tree') {
    // search by tree
    models.Crop.getCropsByTree(req.query.tree, function (result) {
      var data = [];
      result.forEach(function (element) {
        data.push(element.dataValues);
      })

      res.json({
        success: true,
        data: data,
        message: 'Search success !'
      })
    }, models)
  } else if (req.query.type === 'month') {
    // search by month

    models.Crop.getCropByMonth(req.query.month, function (result) {
      res.json({
        success: true,
        data: result,
        message: 'Search success !'
      })
    })
  } else {
    if (req.query.type === 'both') {

      models.Crop.getCropByBoth(req.query.tree, req.query.month, function (result) {
        res.json({
          success: true,
          data: result,
          message: 'Search success !'
        })
      })
    }
    else {
      res.json({
        success: false,
        message: 'Cannot search !'
      })
    }
  }
})

router.get('/reviews', function (req, res) {
  models.Review.getReviewsByCropId(req.query.id, function (reviews) {
    res.json({
      success: true,
      data: reviews,
      message: 'Get reviews success !'
    })
  }, models)
})

module.exports.router = router;
