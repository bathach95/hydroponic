var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var utils = require('../utils/utils');
var parseMqttMsgUtils = require('../utils/parseMqttMsgUtils');
var protocolConstant = require('../utils/protocolConstant');
var Timer = require('../utils/timer');
var TimerCounter = require('../utils/timerCounter');
const mqtt = require('mqtt');
const client = mqtt.connect(protocolConstant.MQTT_BROKER);

// array of timer for each device
var timerArray = [];
//====== auto query mac from database and subscribe to that chanel =======

models.Device.findAll({
  attributes: ['mac']
}).then(function (result) {
  result.forEach(function (item) {
    var topic = 'device/' + item.dataValues.mac + '/server';
    client.subscribe(topic, function () {
      utils.log.info("subscribe success to " + topic)
      console.log("subscribe success to " + topic);
    });
  });
})

//====== auto query mac from database and create a timer counter for that device =======
models.Device.findAll().then(function (result) {
  result.forEach(function (item) {

    var mac = item.dataValues.mac;
    // ======= create timer for device =======
    var callback = function () {
      console.log("sensor data timeout for device: " + mac)
      var msg = "Your device " + item.dataValues.name + " maybe died";
      utils.sendNotifyToMobile(mac, msg);
    }
    var timeout = new Timer(protocolConstant.TIME_OUT_DATA, callback)
    var sensorDataTimeout = new TimerCounter(timeout);
    timerArray[mac] = sensorDataTimeout;
  });
})

//================================ end ===================================

router.get('/all', user.authenticate(), function (req, res) {

  models.User.getUserById(req.user.id, function (user) {
    if (user) {
      user.getDevices({ order: [['createdAt', 'DESC']] }).then(function (result) {
        var deviceList = [];

        result.forEach(function (item) {
          deviceList.push(item.dataValues);
        })

        res.json({
          success: true,
          data: deviceList,
          message: 'Get all device success!'
        });
      });
    } else {
      res.json({
        success: false,
        message: 'User does not exist!'
      })
    }

  });


})

router.get('/running', user.authenticate(), function (req, res) {
  models.User.getUserById(req.user.id, function (user) {
    if (user) {
      user.getDevices({
        where: {
          status: 'running'
        }
      }).then(function (result) {
        var deviceDataList = [];

        Promise.all(result.map(function (item) {
          return new Promise(function (resolve, reject) {
            item.getCrops({
              where: {
                status: 'running'
              }
            }).then(function (cropResult) {
              if (cropResult[0]) {
                return new Promise(function (result, reject) {
                  cropResult[0].getData({ order: [['createdAt', 'DESC']] }).then(function (dataResult) {
                    if (dataResult[0]) {
                      var returnValue = {
                        device: item.dataValues,
                        crop: cropResult[0].dataValues,
                        data: dataResult[0].dataValues
                      };
                      deviceDataList.push(returnValue);
                      resolve(dataResult[0]);
                    }
                    else {
                      var returnValue = {
                        device: item.dataValues,
                        crop: cropResult[0].dataValues,
                        data: {}
                      };
                      deviceDataList.push(returnValue);
                      resolve(dataResult[0]);
                    }
                  });
                });
              } else {
                res.json({
                  success: false,
                  message: "No running crop"
                })
              }
            })
          });
        })).then(function (value) {
          res.json({
            success: true,
            data: deviceDataList,
            message: 'Get running device success!'
          });
        })
      })
    }
    else {
      res.json({
        success: false,
        message: 'User does not exist!'
      })
    }
  });
})

router.put('/status', user.authenticate(), function (req, res) {
  var deviceMac = req.body.mac.toUpperCase();
  var deviceTopic = utils.getDeviceTopic(deviceMac);
  var serverTopic = utils.getServerTopic(deviceMac);
  const newClient = mqtt.connect(protocolConstant.MQTT_BROKER);

  var newStatusCode = req.body.status === 'running' ? '1' : '0';
  var statusMessageToDevice = deviceMac + '03' + '0003' + '00' + newStatusCode;

  // subscribe to server topic to get ACK package from device
  newClient.subscribe(serverTopic, function () {
    console.log('this line subscribe success to ' + serverTopic)
  })


  // ============ create timer ============
  var callback = function () {
    console.log("timeout for request: change device status")
    newClient.end();
    res.json({
      success: false,
      message: "Send message to device timeout. Cannot receive ack from device"
    })
  }
  var mqttMsgTimeout = utils.getMqttMsgTimer(callback);
  // ========================================

  // send update status message to device
  newClient.publish(deviceTopic, utils.encrypt(statusMessageToDevice), protocolConstant.MQTT_OPTIONS, function (err) {
    if (err) {
      console.log(err);
      utils.log.err(err);
      newClient.end(false, function () {
        res.json({
          success: false,
          message: 'Cannot send MQTT update status message to device'
        })
      })

    } else {
      mqttMsgTimeout.resetForOneTime();
      // wait for ack message from device
      newClient.on('message', function (topic, payload) {
        var ack = parseMqttMsgUtils.parseAckMsg(utils.decrypt(payload));
        if (ack) {
          if (ack.mac === deviceMac && ack.data === protocolConstant.ACK.HANDLED) {
            mqttMsgTimeout.deactive();
            // if device received message, update database
            newClient.end();
            models.Device.getDeviceByMac(deviceMac, function (device) {
              if (device) {
                device.updateStatus(req.body.status, function () {
                  res.json({
                    success: true,
                    message: 'Update device status success !'
                  })
                })
              } else {
                res.json({
                  success: false,
                  message: 'Device does not exist !'
                })
              }
            })
          } else {
            res.json({
              success: false,
              message: 'Cannot send MQTT update status message to device'
            })
          }
        }
      })
    }
  });
})

router.get('/one', user.authenticate(), function (req, res) {
  var mac = req.query.mac;

  models.Device.getDeviceByMac(mac,
    function (result) {
      res.send(result);
    },
    function (err) {
      res.send(err);
    }
  );
})


router.post('/add', user.authenticate(), function (req, res) {
  var newDevice = req.body;
  newDevice.UserId = req.user.id;

  // ======= create timer for device =======
  var callback = function () {
    console.log("sensor data timeout for device: " + newDevice.mac)
    var msg = "Your device maybe died";
    utils.sendNotifyToMobile(newDevice.mac, msg);
    utils.updateDeviceStatus(newDevice.mac, protocolConstant.DEVICE_STATUS_RUNNING, protocolConstant.DEVICE_STATUS_NO_CONNECTION);
  }
  var timeout = new Timer(protocolConstant.TIME_OUT_DATA, callback)

  var sensorDataTimeout = new TimerCounter(timeout);
  sensorDataTimeout.reset();
  timerArray[newDevice.mac] = sensorDataTimeout;
  // =======================================

  models.Device.getDeviceByMac(newDevice.mac,
    function (result) {
      if (result) {
        res.json({
          success: false,
          message: "Device has already existed"
        });
      } else {
        var deviceMac = newDevice.mac.toUpperCase();
        var deviceTopic = utils.getDeviceTopic(deviceMac);
        var serverTopic = utils.getServerTopic(deviceMac);
        const newClient = mqtt.connect(protocolConstant.MQTT_BROKER);

        var CMD_ID = '08';
        var DATA_LENGTH = '0001';
        var DATA_ADD = '1';
        var message = deviceMac.replace(/:/g, "") + CMD_ID + DATA_LENGTH + DATA_ADD;

        newClient.subscribe(serverTopic, function () {
          console.log("subscribe success to " + serverTopic + " after add new device")
        })

        newClient.publish(deviceTopic, utils.encrypt(message), protocolConstant.MQTT_OPTIONS, function (err) {
          if (err) {
            console.log(err);
            utils.log.err(err);
            newClient.end(false, function () {
              res.json({
                success: false,
                message: 'Cannot send settings to device.'
              })
            })
          } else {
            // newClient.on('message', function (topic, payload) {
            // var ack = parseMqttMsgUtils.parseAckMsg(utils.decrypt(payload));
            // if (ack && ack.mac === deviceMac) {
            newClient.end();
            // if (ack.data === protocolConstant.ACK.HANDLED) {

            models.Device.createDevice(newDevice, function () {
              client.subscribe(serverTopic, function () {
                utils.log.info("subscribe success after add new device");
                console.log("subscribe success after add new device");
                res.json({
                  success: true,
                  message: "Add device success"
                });
              });

            }, function (err) {
              utils.log.error(err);
              res.json({
                success: false,
                message: 'Cannot add device.'
              })
            })



            // } else {
            //   res.json({
            //     success: false,
            //     message: 'Cannot send add device message.'
            //   })
            // }
            // }
            // })
          }
        })
      }
    },
    function (err) {
      utils.log.error(err);
      res.json({
        success: false,
        message: "Cannot add new device"
      });
    }
  )

});

router.delete('/delete', user.authenticate(), function (req, res) {
  var deviceMac = req.query.mac.toUpperCase();
  var deviceTopic = utils.getDeviceTopic(deviceMac);
  var serverTopic = utils.getServerTopic(deviceMac);
  const newClient = mqtt.connect(protocolConstant.MQTT_BROKER);

  var CMD_ID = '08';
  var DATA_LENGTH = '0001';
  var DATA_DELETE = '0';
  var message = deviceMac.replace(/:/g, "") + CMD_ID + DATA_LENGTH + DATA_DELETE;

  newClient.subscribe(serverTopic, function () {
    console.log("subscribe success to delete device")
  })

  // ============ create timer ============
  var callback = function () {
    console.log("timeout for request: delete device")
    newClient.end();
    res.json({
      success: false,
      message: "Send message to device timeout. Cannot receive ack from device"
    })
  }
  var mqttMsgTimeout = utils.getMqttMsgTimer(callback);
  // ========================================

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
      mqttMsgTimeout.resetForOneTime();
      newClient.on('message', function (topic, payload) {
        var ack = parseMqttMsgUtils.parseAckMsg(utils.decrypt(payload));
        if (ack && ack.mac === deviceMac) {
          mqttMsgTimeout.deactive();
          newClient.end();
          if (ack.data === protocolConstant.ACK.HANDLED) {

            models.Device.deleteDevice(req.query.mac, function (success) {
              if (success) {
                // deactive timer of this device
                timerArray[req.query.mac].deactive();
                client.unsubscribe(utils.getServerTopic(req.query.mac));
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

          } else {
            res.json({
              success: false,
              message: 'Cannot send delete device message.'
            })
          }
        }
      })

    }
  })
});

module.exports.client = client;
module.exports.router = router;
module.exports.timerArray = timerArray;
