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
          cropList.push(item.dataValues);
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

  models.Crop.getNewestRunningCropByDeviceMac(req.query.mac, function (result) {
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

router.post('/add', user.authenticate(), function (req, res) {
  // check crop name already exist
  models.Crop.getCropByName(req.body.name, req.body.DeviceMac, function (result) {
    if (result) {
      res.json({
        success: false,
        message: "Crop name has already existed."
      });
    } else {
      var deviceMac = req.body.DeviceMac.toUpperCase();
      var deviceTopic = utils.getDeviceTopic(deviceMac);
      var serverTopic = utils.getServerTopic(deviceMac);
      const client = mqtt.connect(protocolConstant.MQTT_BROKER);
      var parseTimeFormat = "MM/DD/YYYY HH:mm A";
      var sendTimeFormat = "YYYYMMDDHHmmss";
    
      var reporttime = utils.secondsToHMS(req.body.reporttime);
      var message = deviceMac.replace(/:/g,"") + '01' + '0034' 
                    + moment(req.body.startdate, parseTimeFormat).format(sendTimeFormat) 
                    + moment(req.body.closedate, parseTimeFormat).format(sendTimeFormat) 
                    + reporttime.hours + reporttime.mins + reporttime.seconds;

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
                var newCrop = req.body;
                newCrop.startdate = moment(req.body.startdate, parseTimeFormat);
                newCrop.closedate = moment(req.body.closedate, parseTimeFormat);
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
  });

})

router.delete('/delete', user.authenticate(), function (req, res) {
  models.Crop.deleteCrop(req.query.id, function (success) {
    if (success) {
      res.json({
        success: true,
        message: "Crop is deleted"
      });
    } else {
      res.json({
        success: false,
        message: "Crop can not be deleted"
      });
    }
  })
})

router.put('/edit', user.authenticate(), function (req, res) {
  models.Crop.getCropById(req.body.id, function (result) {
    if (!result)
    {
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
                }).catch(function(err){
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
