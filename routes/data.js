var express = require('express');
var router = express.Router();
var user = require('./user.js');
var models = require('../models');
var moment = require('moment');
var device = require('./device.js');
var utils = require('../utils/utils');
var parseMqttMsgUtils = require('../utils/parseMqttMsgUtils');

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
    console.log(data)
    if (device.timerArray[data.mac]){
      device.timerArray[data.mac].reset();
    }
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
              console.log("add data success to running crop " + data.mac)
            }, function (err) {
              utils.log.error(runningCrop.id + err);
              console.log("add data error" + err)
            })

          if (oldData) {
            models.Threshold.getNewestThresholdByCropId(runningCrop.id, function (threshold) {
              if (threshold) {

                var oldDataStatus = utils.getDataStatus(oldData, threshold);
                var newDataStatus = utils.getDataStatus(newData, threshold);

                if (oldDataStatus.status && newDataStatus.status) {
                  var notifyStatus = {
                    temp: oldDataStatus.badStatus.temp && newDataStatus.badStatus.temp,
                    humidity: oldDataStatus.badStatus.humidity && newDataStatus.badStatus.humidity,
                    light: oldDataStatus.badStatus.light && newDataStatus.badStatus.light,
                    ppm: oldDataStatus.badStatus.ppm && newDataStatus.badStatus.ppm
                  }

                  var MSG = "Your system is having problemt with ";

                  if (notifyStatus.temp) {
                    utils.sendNotifyToMobile(data.mac, MSG + "temperature");
                  }

                  if (notifyStatus.humidity) {
                    utils.sendNotifyToMobile(data.mac,MSG + "humidity");
                  }

                  if (notifyStatus.light) {
                    utils.sendNotifyToMobile(data.mac, MSG + "light");
                  }

                  if (notifyStatus.ppm) {
                    utils.sendNotifyToMobile(data.mac, MSG + "ppm");
                  }
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
