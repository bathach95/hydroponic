var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var models = require('../models');
var jwt = require('jsonwebtoken');
var Cookies = require('cookies');
var opts = {
  secretOrKey: 'hydroponic',
  jwtFromRequest: ExtractJwt.fromHeader('token')
}

/* set up jwt Strategy for passport */
passport.use(new Strategy(opts, function(jwt_payload, done){
  return done(null, jwt_payload);
}));

/* ensure authentication */
var authenticate = function(){
  return passport.authenticate('jwt', {session: false});
}

/* register action */
router.post('/register', function(req, res){

  var newUser = {
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    phone: req.body.phone
  };

  models.User.getUserByEmail(newUser.email, function(user){
    if(user){
      res.json({
        success: false,
        data: {
          message: 'Register failed. Email has already exist!'
        }
      });
    }
    else{
      models.User.createUser(newUser);
      res.json({
        success: true,
        data: {
          message: 'Register success!',
          name: newUser.name
        }
      });
    }
  });
});
/* end register action*/

/* login action */
router.post('/login',function(req, res){
  models.User.getUserByEmail(req.body.email, function(user){
    if (user){
      models.User.comparePassword(req.body.password, user.password, function(isMatch){
        if (isMatch){
          var usr = {
            name: user.name,
            email: user.email
          }
          var token = jwt.sign(usr,'hydroponic',{expiresIn:30000});
          res.json({
            success: true,
            data: {
              message: 'Login success!',
              name: user.name
            },
            token: token
          });
        }
        else res.json({
          success: false,
          data: {
            message: 'Login failed!'
          },
          error: 'Wrong password'
        });
      });
    }
    else res.json({
      success: false,
      data: {
        message: 'Login failed!'
      },
      error: 'name invalid'
    });
  });
});
/* end login action */


router.get('/profile', function(req, res){
  // TODO: ensure authentication here and render profile page
  res.render('profile');
})


module.exports.authenticate = authenticate;
module.exports.router = router;
