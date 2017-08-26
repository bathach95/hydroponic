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
var randToken = require('rand-token');

/* config acl and acl-sequelize */

var path = require("path");
var Acl = require('acl');
var Sequelize = require('sequelize');
var AclSeq = require('acl-sequelize');
var env = "development";
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var db = module.exports = new Sequelize(config.database, config.username, config.password, config);
var acl = new Acl(new AclSeq(db, { prefix: 'acl_' }));

/* end config acl and acl-sequelize */

/* config for passport-jwt */
var opts = {
  secretOrKey: 'hydroponic',
  jwtFromRequest: ExtractJwt.fromHeader('token')
}
/* end config for passport-jwt */

/* create node mailer transport */
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'bkhydroponic2017@gmail.com',
    pass: 'hydroponic'
  }
});
/* end create node mailer transport */

/* testing acl user role */
acl.addUserRoles('8', 'admin');
acl.addUserRoles('10', 'member');

acl.addRoleParents('admin', 'member');

acl.allow('admin', ['/dashboard'], '*');
acl.allow('member', ['/dashboard'], 'get');

/* set up jwt Strategy for passport */
passport.use(new Strategy(opts, function (jwt_payload, done) {
  return done(null, jwt_payload);
}));

/* ensure authentication */
var authenticate = function () {
  return passport.authenticate('jwt', {
    session: false
  });
}

/* automatedly create an admin account */

// check whether admin account was created or not
models.User.getUserByEmail('hbathach@gmail.com', function (user) {
  if (user) {
    console.log('Admin account was created');
  } else {
    var admin = {
      name: 'Thach',
      password: 'bkhydroponic2017',
      email: 'hbathach@gmail.com',
      phone: '01696030126',
      role: 'admin', // 'user', 'admin' and 'mod'
      status: true,
      activeToken: randToken.generate(30)
    };

    models.User.createUser(admin, function () {
      console.log('Admin account created')
    })
  }
})

/* end create admin account */

/* register action */
router.post('/register', function (req, res) {

  var newUser = {
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    phone: req.body.phone,
    role: 'user', // 'user', 'admin' and 'mod'
    activeToken: randToken.generate(30)
  };

  models.User.getUserByEmail(newUser.email, function (user) {
    if (user) {
      res.json({
        success: false,
        message: 'Register failed. Email has already exist!'
      });
    } else {
      models.User.createUser(newUser, function () {
        /* send active email to user's email */
        // email setting
        var domain = req.headers.host;
        var mailOptions = {
          from: 'BK Hydroponic <bkhydroponic2017@gmail.com>',
          to: newUser.email,
          subject: 'Kích hoạt tài khoản',
          html: '<strong>Chúc mừng ' + newUser.name + ' đã đăng ký thành công tài khoản tại Bk Hydroponic. </strong><br><p>Thông tin đăng ký</p><ul><li>Email: ' + newUser.email + '</li><li>Tên hiển thị: ' + newUser.name + '</li><li>Mật khẩu: ******</li></ul><br /><p>Vui lòng kích hoạt tài khoản bằng cách nhấn &nbsp;<a href="http://' + domain + '#/user/active/' + newUser.email + '/' + newUser.activeToken + '"target="_blank">vào đây</a>'
        };

        // send email
        transporter.sendMail(mailOptions, function (error, info) {
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
              message: 'Register success! Please check your email to active your account'
            });
          }
        });


      });
    }
  });
});
/* end register action*/

/* login action */
router.post('/login', function (req, res) {
  models.User.getUserByEmail(req.body.email, function (user) {
    if (user) {
      user.comparePassword(req.body.password, function (isMatch) {
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
              userid: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone,
              role: user.role,
              token: token
            },
            message: 'Login success!'
          });
        } else res.json({
          success: false,
          message: 'Login failed! Wrong password'
        });
      });
    } else res.json({
      success: false,
      message: 'Login failed! Wrong email'
    });
  });
});
/* end login action */

/* update action*/
router.put('/update', authenticate(), function (req, res) {

  console.log(req.user);

  models.User.getUserByEmail(req.body.email, function (user) {
    if (user) {
      user.update({
        name: req.body.name,
        phone: req.body.phone
      }).then(function () {
        res.json({
          success: true,
          message: 'Update success!'
        });
      });
    } else {
      res.json({
        success: false,
        message: 'Cannot find user'
      })
    }

  })
})
/* end update action*/

/* change pass action*/
router.put('/changepass', authenticate(), function (req, res) {
  models.User.getUserByEmail(req.body.email, function (user) {
    user.comparePassword(req.body.currPass, function (isMatch) {
      if (isMatch) {
        user.updatePassword(req.body.newPass, function () {
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
router.post('/resetpass', function (req, res) {

  /* find user by email and update password to 12345 */

  models.User.getUserByEmail(req.body.email, function (user) {
    if (user) {
      var newPass = randToken.generate(10);
      user.updatePassword(newPass, function () {

        // email setting
        var domain = req.headers.host;
        var mailOptions = {
          from: 'BK Hydroponic <bkhydroponic2017@gmail.com>',
          to: req.body.email,
          subject: 'Thay đổi mật khẩu',
          html: '<p> Mật khẩu hiện tại của bạn là <strong>' + newPass + '</strong>. Bạn phải <a href="http://' + domain + '#/login">đăng nhập</a> và thực hiện đổi mật khẩu để đảm bảo tính bảo mật cho tài khoản của bạn. </p>'
        };

        // send email
        transporter.sendMail(mailOptions, function (error, info) {
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

/* active account */
router.put('/active', function (req, res) {

  var data = req.body;
  models.User.getUserByEmail(data.email, function (user) {
    if (user) {
      if (user.activeToken === data.token) {
        user.updateStatus(true, function () {
          res.json({
            success: true,
            message: 'Your account has been actived. Login to enjoy'
          })
        })
      } else {
        res.json({
          success: false,
          message: 'Invalid token'
        })
      }

    } else {
      res.json({
        success: false,
        message: 'Cannot find user'
      })
    }
  })

});
/* end active account */
module.exports.authenticate = authenticate;
module.exports.router = router;
module.exports.acl = acl;
