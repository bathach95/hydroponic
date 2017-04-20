var express = require('express');
var router = express.Router();

/* GET login page */
router.get("/login", function(req, res){
  res.render("login", {title: 'Login'});
});

router.get("/", function(req, res){
  res.render("index", {title: 'Hydroponic'});
});

/* GET register page */
router.get("/register", function(req, res){
  res.render("register", {title: 'Register'});
});


module.exports = router;
