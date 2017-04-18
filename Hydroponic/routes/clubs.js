var express = require('express');
var router = express.Router();
var users = require('./users.js');
var models = require('../models');



/* TODO: test add club just for admin */
router.post('/addclub', function(req, res){
  res.send('ok');
});


module.exports.router = router;
