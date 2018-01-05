var express = require('express');
var router = express.Router();
var user = require('./user.js');
var path = require("path");
var utils = require('../utils/utils');
var models = require('../models');
var fs = require('fs');

router.get("/", function (req, res) {
  res.render("index");
});

module.exports = router;
