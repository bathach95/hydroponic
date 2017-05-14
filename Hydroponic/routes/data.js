var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

router.get('/all', user.authenticate(), function(req, res){
  var cropId = req.query.cropId;

  models.Data.getAllDataByCropId(cropId, function(result){
    res.send(result);
  })
})

router.get('/newest', user.authenticate(), function(req, res){
  var cropId = req.query.cropId;

  models.Data.getNewestDataByCropId(cropId, function(result){
    res.send(result);
  });
})
module.exports.router = router;
