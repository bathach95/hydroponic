var express = require('express');
var router = express.Router();
var user = require('./user.js')

router.get("/", function(req, res){
  res.render("index");
});

router.get("/dashboard", function(req, res){
  console.log(req.user);
  res.send('This is dashboard');
});
module.exports = router;
