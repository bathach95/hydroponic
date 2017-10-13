var express = require('express');
var router = express.Router();
var user = require('./user.js');
var path = require("path");
var utils = require('./utils.js');

router.get("/", function (req, res) {
  res.render("index");
});

router.post('/', function(req, res){
  res.send('post');
})

router.put('/', function(req, res){
  res.send('put')
})

router.delete('/', function(req, res){
  res.send('delete')
})

router.get("/admin", [user.authenticate(), user.acl.middleware(1, utils.getUserId)], function (req, res) {
  res.json({
    success: true,
    message: 'You are admin'
  })
});


router.get("/mod", [user.authenticate(), user.acl.middleware(1, utils.getUserId)], function (req, res) {
  res.json({
    success: true,
    message: 'You are mod'
  })
});
module.exports = router;
