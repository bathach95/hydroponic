var express = require('express');
var router = express.Router();
var user = require('./user.js')
var models = require('../models');

router.put('edit', user.authenticate(), function(req, res){

})

module.exports.router = router;
