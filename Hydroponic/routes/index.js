var express = require('express');
var router = express.Router();

router.get("/", function(req, res){
  res.render("index");
});

// /* GET register page */
// router.get("/register", function(req, res){
//   res.render("register", {title: 'Register'});
// });

// router.get('/system', function (req, res) {
//   res.render("services");
// });
//
// router.get('/article', function (req, res) {
//   res.render("single");
// });
//
// router.get('/forum', function (req, res) {
//   res.render("gallery");
// });
//
// router.get('/about', function (req, res) {
//   res.render("about");
// });


module.exports = router;
