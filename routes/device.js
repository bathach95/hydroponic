var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://13.58.114.56:1883');

//====== auto query mac from database and subscribe to that chanel =======

models.Device.findAll({
  attributes: ['mac']
}).then(function (result) {
  result.forEach(function (item) {
    var topic = 'device/' + item.dataValues.mac + '/server';
    client.subscribe(topic, function () {
      console.log("subscribe success to " + topic);
    });
  });
})


function sendDeviceStatusToDevice(mac, newStatusMessageToDevice) {
  var deviceTopic = 'device/' + mac + "/esp";
  client.publish(deviceTopic, newStatusMessageToDevice);

}

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

router.get('/running', user.authenticate(), function(req, res){
  models.User.getUserById(req.user.id, function (user) {
    if (user) {
      user.getDevices({
        where:{
          status: 'running'
        }
      }).then(function (result) {
        var deviceDataList = [];

        Promise.all(result.map(function(item){
          return new Promise(function(resolve, reject) {
            item.getCrops({
              where:{
                status: 'running'
              }
            }).then(function (cropResult) {
              return new Promise(function(result, reject){
                cropResult[0].getData({ order: [['createdAt', 'DESC']] }).then(function (dataResult) {
                  if (dataResult[0])
                  {
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
        })).then(function(value) {
          res.json({
            success: true,
            data: deviceDataList,
            message: 'Get running device success!'
          });
        })
      })
    }
    else
    {
      res.json({
        success: false,
        message: 'User does not exist!'
      })
      console.log(5678);
    }
  });
})

router.put('/status', user.authenticate(), function(req, res){
  setTimeout(function () {
    models.Device.getDeviceByMac(req.body.mac, function (device) {
      if (device) {
        device.updateStatus(req.body.status, function () {
          var newStatusCode;
          if (req.body.status == 'running')
          {
            newStatusCode = '1';
          }
          else {
            newStatusCode = '0';
          }
          var statusMessageToDevice = req.body.mac.replace(/:/g,"").toUpperCase() + '03' + '0003' + '00' + newStatusCode;
          sendDeviceStatusToDevice(req.body.mac, statusMessageToDevice);

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
  }, 1500);
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
  models.Device.getDeviceByMac(newDevice.mac,
    function (result) {
      if (result) {
        res.json({
          success: false,
          message: "Device has already existed"
        });
      } else {
        models.Device.createDevice(newDevice,
          function () {

            // this topic is for send and receive data
            var topic = 'device/' + newDevice.mac + '/server'

            client.subscribe(topic, function () {
              console.log("subscribe success after add new device");
            });

            res.json({
              success: true,
              message: "Add device success"
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
