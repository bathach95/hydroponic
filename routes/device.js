var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var utils = require('../utils/utils');
var parseMqttMsgUtils = require('../utils/parseMqttMsgUtils');
var protocolConstant = require('../utils/protocolConstant');
const mqtt = require('mqtt');
const client = mqtt.connect(protocolConstant.MQTT_BROKER);

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
  var deviceMac = req.body.mac;
  var deviceTopic = utils.getDeviceTopic(deviceMac);
  var serverTopic = utils.getServerTopic(deviceMac);
  const client = mqtt.connect(protocolConstant.MQTT_BROKER);

  var newStatusCode = req.body.status === 'running' ? '1' : '0';
  var statusMessageToDevice = deviceMac.toUpperCase() + '03' + '0003' + '00' + newStatusCode;

  // subscribe to server topic to get ACK package from device
  client.subscribe(serverTopic, function () {
    console.log('this line subscribe success to ' + serverTopic)
  })
  // send update status message to device
  client.publish(deviceTopic, utils.encrypt(statusMessageToDevice), function (err) {
    if (err) {
      console.log(err);
      utils.log.err(err);
      client.end(false, function () {
        res.json({
          success: false,
          message: 'Cannot send MQTT update status message to device'
        })
      })

    } else {
      // wait for ack message from device
      client.on('message', function (topic, payload) {
        var ack = parseMqttMsgUtils.parseAckMsg(utils.decrypt(payload));
        if (ack) {
          if (ack.mac === deviceMac && ack.data === protocolConstant.ACK.HANDLED) {
            // if device received message, update database
            client.end();
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

// ------- success -----
router.post('/addtest', user.authenticate(), function (req, res) {
  var newDevice = req.body;
  models.User.getUserById(req.user.id, function (user) {
    user.createDevice(newDevice).then(function () {
      utils.log.info('Created device' + newDevice)

      res.json({
        success: true,
        message: "add success !!!!"
      })
    }).catch(function (err) {
      utils.log.error(err)

      res.json({
        success: false,
        message: "Deviced has already existed !"
      })
    })
  })
});

router.post('/add', user.authenticate(), function (req, res) {
  var newDevice = req.body;
  newDevice.UserId = req.user.id;
  models.Device.getDeviceByMac(newDevice.mac,
    function (result) {
      if (result) {
        res.json({
          success: false,
          message: "Device has already existed"
        });
      } else {
        models.Device.createDevice(newDevice, function () {

          // this topic is for send and receive data
          var topic = 'device/' + newDevice.mac + '/server'

          client.subscribe(topic, function () {
            utils.log.info("subscribe success after add new device");
            console.log("subscribe success after add new device");
            res.json({
              success: true,
              message: "Add device success"
            });
          });
        },
          function (err) {
            res.json({
              success: false,
              message: err
            });
          }
        );
      }
    },
    function (err) {
      res.json({
        success: false,
        message: err
      });
    }
  )

});

router.delete('/delete', user.authenticate(), function (req, res) {
  models.Device.deleteDevice(req.query.mac, function (success) {
    if (success) {
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
});

module.exports.client = client;
module.exports.router = router;
