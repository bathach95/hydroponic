var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

router.get('/all', user.authenticate(), function(req, res){
  var mac = req.query.mac;
  models.Crop.getCropsByDeviceMac(mac,
    function(result){
      var cropList = [];
      result.forEach(function(item, index){
        cropList.push(item.dataValues);
      });
      res.send(cropList);
    });
})

router.get('/one', user.authenticate(), function(req, res){
  var id = req.query.id;

  models.Crop.getCropById(id, function(result){
    res.send(result);
  })
})

router.post('/add', user.authenticate(), function(req, res){
  var newCrop = req.body;
  models.Crop.createCrop(newCrop, function(){
    // TODO: check time overlap between crops
    res.send({
      success: true,
      message: "Add crop success"
    });
  })
})
module.exports.router = router;
