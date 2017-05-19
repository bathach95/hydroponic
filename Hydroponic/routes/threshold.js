var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

router.get('/newest', user.authenticate(), function(req, res) {
    var cropId = req.query.cropId;

    models.Threshold.getNewestThresholdByCropId(cropId, function(result){
      res.send(result);
    });
})

router.put('/edit', user.authenticate(), function(req, res){

})
module.exports.router = router;
