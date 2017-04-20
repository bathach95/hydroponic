var express = require('express');
var router = express.Router();

router.get("/", function(req, res){
  // TODO: ensure authenticattion, get device id here, query database and return device info
  res.render('device-detail');
})

router.get("/crop", function(req, res){
  // TODO: ensure authenticattion, get crop id here, query database and return crop info
  res.render('crop-detail');
})

router.get("/crop/log", function(req, res){
  // TODO: ensure authenticattion, get crop id here, query database and return crop info
  res.render('all-logs');
})

module.exports.router = router;
