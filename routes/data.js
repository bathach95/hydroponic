var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var moment = require('moment');
var device = require('./device.js');
var FCM = require('fcm-node');
var utils = require('../utils/utils');
var parseMqttMsgUtils = require('../utils/parseMqttMsgUtils');
var serverKey = 'AIzaSyD0XtvqNAw6kTO34Ot50WsJkQF568kDuR4';
var fcm = new FCM(serverKey);

// send notify to mobile
function sendNotifyToMobile(topicMac, type) {
  var message = {
    to: '/topics/' + topicMac,
    notification: {
      title: 'BK Hydroponic',
      body: 'Your system is having problem with ' + type
    }
  };

  fcm.send(message, function (err, response) {
    if (err) {
      utils.log.error("Notify err: " + err);
      console.log("Notify err: " + err)
    } else {
      utils.log.info("Notify sucess: " + response);
      console.log("Notify sucess: " + response);
    }
  });
}

// update device status function
function updateDeviceStatus(mac) {
  models.Device.getDeviceByMac(mac, function (device) {
    if (device.dataValues.status === "no connection") {
      device.update({
        status: "running"
      }).then(function (res) {
        if (res) {
          utils.log.info(mac + " update device status success")
          console.log("update device status success");
        } else {
          utils.log.error(mac + " update device status fail")
          console.log("update device status fail");
        }
      });
    }
  });
}
// update crop status
function updateCropStatus(cropId, fromStatus, toStatus) {
  models.Crop.getCropById(cropId, function (crop) {
    if (crop.dataValues.status === fromStatus) {
      crop.update({
        status: toStatus
      }).then(function (res) {
        if (res) {
          utils.log.info(cropId + " update crop status success");
          console.log("update crop status success");
        } else {
          utils.log.error(cropId + " update crop status fail");
          console.log("update crop status fail");
        }
      });
    }
  });
}


// receive data from device and add to database
device.client.on('message', function (topic, message) {

  var data = parseMqttMsgUtils.parseReceivedData(utils.decrypt(message));

  if (data) {
    models.Crop.getNewestRunningCropByDeviceMac(data.mac, function (runningCrop) {

      var newData = {
        light: data.light,
        ppm: data.ppm,
        humidity: data.humidity,
        temperature: data.temp
      }

      if (runningCrop && (runningCrop.dataValues.closedate > new Date())) {
        newData.CropId = runningCrop.id;

        models.Data.getNewestDataByCropId(runningCrop.id, function (oldData) {

          // if there is a running crop, add data to it
          models.Data.createData(newData,
            function (res) {
              utils.log.info(runningCrop.id + " add data success to running crop");
              console.log("add data success to running crop")
            }, function (err) {
              utils.log.error(runningCrop.id + err);
              console.log("add data error" + err)
            })

          if (oldData) {
            models.Threshold.getNewestThresholdByCropId(runningCrop.id, function (threshold) {
              var oldDataStatus = utils.getDataStatus(oldData, threshold);
              var newDataStatus = utils.getDataStatus(newData, threshold);

              if (oldDataStatus.status && newDataStatus.status) {
                var notifyStatus = {
                  temp: oldDataStatus.badStatus.temp && newDataStatus.badStatus.temp,
                  humidity: oldDataStatus.badStatus.humidity && newDataStatus.badStatus.humidity,
                  light: oldDataStatus.badStatus.light && newDataStatus.badStatus.light,
                  ppm: oldDataStatus.badStatus.ppm && newDataStatus.badStatus.ppm
                }

                if (notifyStatus.temp) {
                  sendNotifyToMobile(data.mac, "temperature");
                }

                if (notifyStatus.humidity) {
                  sendNotifyToMobile(data.mac, "humidity");
                }

                if (notifyStatus.light) {
                  sendNotifyToMobile(data.mac, "light");
                }

                if (notifyStatus.ppm) {
                  sendNotifyToMobile(data.mac, "ppm");
                }
              }

            })
          }
        })


      } else {
        // if no running crop, add data to nearest pending crop
        models.Crop.getOldestPendingCropByDeviceMac(data.mac, function (pendingCrop) {
          if (pendingCrop) {
            newData.CropId = pendingCrop.id;

            models.Data.createData(newData,
              function (res) {
                console.log("add data success to pending crop")
                updateDeviceStatus(data.mac);
                updateCropStatus(pendingCrop.id, "pending", "running");

              }, function (err) {
                utils.log.error("Add data pending " + err);
                console.log("Add data pending " + err)
              })

          } else {
            utils.log.info('No running or pending crop');
            console.log('No running or pending crop')
          }
        })
      }
    })
  } else {
    utils.log.error("Incoming data is not right format");
    console.log("Data is not right !")
  }

});
// ======================== end =================

router.get('/all', user.authenticate(), function (req, res) {

  models.Data.getAllDataByCropId(req.query.cropId, function (result) {
    var dataList = [];

    result.forEach(function (item) {
      dataList.push(item.dataValues);
    })

    res.json({
      success: true,
      data: dataList,
      message: 'Get all data success!'
    });
  })
})

router.get('/newest', user.authenticate(), function (req, res) {
  var cropId = req.query.cropId;

  models.Data.getNewestDataByCropId(cropId, function (result) {
    if (result) {
      res.json({
        success: true,
        data: result.dataValues,
        message: 'Get newest data success !'
      });
    } else {
      res.json({
        success: false,
        message: 'No data'
      });
    }

  });
})

module.exports.router = router;
