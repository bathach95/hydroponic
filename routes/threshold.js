var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

router.get('/newest', user.authenticate(), function(req, res) {
  var cropId = req.query.cropId;

  models.Threshold.getNewestThresholdByCropId(cropId, function(result) {
    if (result){
      res.json({
        success: true,
        data: result.dataValues,
        message: 'Get threshold success'
      })
    } else {
      res.json({
        success: false,
        message: 'No threshold'
      })
    }
  });
})

router.post('/add', user.authenticate(), function(req, res) {
  var newThreshold = req.body;
  models.Threshold.createThreshold(newThreshold,
    function() {
      res.send({
        success: true,
        message: "Edit threshold success"
      })
    },
    function() {
      res.send({
        success: false,
        message: "Edit threshold failed"
      })
    }
  );
})
module.exports.router = router;
