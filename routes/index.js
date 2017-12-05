var express = require('express');
var router = express.Router();
var user = require('./user.js');
var path = require("path");
var utils = require('../utils/utils');
var fs = require('fs');



router.get("/", function (req, res) {
  res.render("index");
});

// , [user.authenticate(), user.acl.middleware(1, utils.getUserId)]
router.get("/admin/log", function (req, res) {
  var logPath = path.join(__dirname + '/../public/log');
  fs.readdir(logPath, function (err, files) {
    if (err) {
      console.log(err);
      return;
    }
    files.forEach(function (f) {
      console.log('Files: ' + f);
      res.sendFile(logPath + f);
    });
    console.log("path is: " + logPath)
  });
  res.render("log");
});

module.exports = router;
