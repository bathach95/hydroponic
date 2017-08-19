var express = require('express');
var router = express.Router();
var passport = require('passport');
var passportJWT = require('passport-jwt');
var ExtractJwt = passportJWT.ExtractJwt;
var Strategy = passportJWT.Strategy;
var models = require('../models');
var jwt = require('jsonwebtoken');
var flash = require('req-flash');
var Cookies = require('cookies');
var nodemailer = require('nodemailer');
var opts = {
  secretOrKey: 'hydroponic',
  jwtFromRequest: ExtractJwt.fromHeader('token')
}

/* create node mailer transport */
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
      user: 'bkhydroponic2017@gmail.com',
      pass: 'hydroponic'
  }
});

/* set up jwt Strategy for passport */
passport.use(new Strategy(opts, function(jwt_payload, done) {
  return done(null, jwt_payload);
}));

/* ensure authentication */
var authenticate = function() {
  return passport.authenticate('jwt', {
    session: false
  });
}

/* register action */
router.post('/register', function(req, res) {

  var newUser = {
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    phone: req.body.phone
  };

  models.User.getUserByEmail(newUser.email, function(user) {
    if (user) {
      res.json({
        success: false,
        data: {
          message: 'Register failed. Email has already exist!'
        }
      });
    } else {
      models.User.createUser(newUser, function(){
        res.json({
          success: true,
          data: {
            message: 'Register success!',
            name: newUser.name
          }
        });
      });
    }
  });
});
/* end register action*/

/* login action */
router.post('/login', function(req, res) {
  models.User.getUserByEmail(req.body.email, function(user) {
    if (user) {
      user.comparePassword(req.body.password, function(isMatch) {
        if (isMatch) {
          var usr = {
            id: user.id,
            username: user.name,
            email: user.email
          }
          var token = jwt.sign(usr, 'hydroponic', {
            expiresIn: 300000
          });
          res.json({
            success: true,
            data: {
              message: 'Login success!',
              userid: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone
            },
            token: token
          });
        } else res.json({
          success: false,
          data: {
            message: 'Login failed!'
          },
          error: 'Wrong password'
        });
      });
    } else res.json({
      success: false,
      data: {
        message: 'Login failed!'
      },
      error: 'Wrong email'
    });
  });
});
/* end login action */

/* update action*/
router.put('/update', authenticate(), function(req, res) {

  models.User.getUserByEmail(req.body.email, function(user) {
    user.update({
      name: req.body.name,
      phone: req.body.phone
    }).then(function() {
      res.send("Update success!");
    });
  })
})
/* end update action*/

/* change pass action*/
router.put('/changepass', authenticate(), function(req, res) {
  models.User.getUserByEmail(req.body.email, function(user) {
    user.comparePassword(req.body.currPass, function(isMatch) {
      if (isMatch) {
        user.updatePassword(req.body.newPass, function(){
          res.json({
            success: true,
            message: "Change password success"
          });
        });

      } else res.json({
        success: false,
        message: 'Wrong current password'
      });
    });
  })
});
/* end change pass action */

/* reset password */
router.post('/resetpass', function(req, res){
  
  /* find user by email and update password to 12345 */

  models.User.getUserByEmail(req.body.email, function(user) {
    if (user){
      var newPass = '12345';
      user.updatePassword(newPass, function(){

        // email setting
        var domain = req.headers.host;
        var mailOptions = {
          from: 'BK Hydroponic <bkhydroponic2017@gmail.com>', 
          to: req.body.email, 
          subject: 'Thay đổi mật khẩu', 
          html: '<p> Mật khẩu hiện tại của bạn là <strong>12345</strong>. Bạn phải <a href="http://' + domain + '#/login">đăng nhập</a> và thực hiện đổi mật khẩu để đảm bảo tính bảo mật cho tài khoản của bạn. </p>'
        };
      
        // send email
        transporter.sendMail(mailOptions, function(error, info) {
            if (error) {
                res.json({
                  success: false,
                  message: error
                });
            }
            else {
                console.log('Message sent: ' + info.response);
                res.json({
                  success: true,
                  message: 'An email has been sent from BK Hydroponic. Please check your email!'
                });
            }
        });

      })
    } else {
      res.json({
        success: false,
        message: 'This email has not been registered yet!'
      });
    }
  })



  
});
/* end reset password */
module.exports.authenticate = authenticate;
module.exports.router = router;
