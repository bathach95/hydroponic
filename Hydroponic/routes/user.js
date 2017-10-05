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
var utils = require('./utils.js')
/* config acl and acl-sequelize */

var path = require("path");
var Acl = require('acl');
var Sequelize = require('sequelize');
var AclSeq = require('acl-sequelize');
var env = "development";
var config = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var db = new Sequelize(config.database, config.username, config.password, config);
var acl = new Acl(new AclSeq(db, { prefix: 'acl_' }));


/* config for passport-jwt */
var secretKey = 'hydroponic';
var opts = {
  secretOrKey: secretKey,
  jwtFromRequest: ExtractJwt.fromHeader('token')
}

/* config role */
utils.setRole(acl);

/* create node mailer transport */
var transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'bkhydroponic2017@gmail.com',
    pass: 'hydroponic'
  }
});

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

/* get user info */
router.get('/info', authenticate(), function (req, res) {

  models.User.getUserById(req.user.id, function (result) {
    if (result) {
      var user = result.dataValues;
      delete user.password;
      delete user.activeToken;

      res.json({
        success: true,
        data: user,
        message: 'Get user info success!'
      })
    } else {
      res.json({
        success: false,
        message: 'User does not exist!'
      })
    }
  })
});

/* register action */
router.post('/register', function (req, res) {

  var newUser = {
    name: req.body.name,
    password: req.body.password,
    email: req.body.email,
    phone: req.body.phone,
    role: 'member', // 'member', 'admin' and 'mod'
    activeToken: randToken.generate(30)
  };

  models.User.getUserByEmail(newUser.email, function (user) {
    if (user) {
      res.json({
        success: false,
        message: 'Register failed. Email has already exist!'
      });
    } else {
      models.User.createUser(newUser, function (result) {

        // set role 'member' for user register
        acl.addUserRoles(result.dataValues.id, 'member');

        // email setting
        var domain = req.headers.host;
        var mailOptions = {
          from: 'BK Hydroponic <bkhydroponic2017@gmail.com>',
          to: newUser.email,
          subject: 'Kích hoạt tài khoản',
          html: '<strong>Chúc mừng ' + newUser.name + ' đã đăng ký thành công tài khoản tại Bk Hydroponic. </strong><br><p>Thông tin đăng ký</p><ul><li>Email: ' + newUser.email + '</li><li>Tên hiển thị: ' + newUser.name + '</li><li>Mật khẩu: ******</li></ul><br /><p>Vui lòng kích hoạt tài khoản bằng cách nhấn &nbsp;<a href="http://' + domain + '/user/active/' + newUser.email + '/' + newUser.activeToken + '"target="_blank">vào đây</a>'
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

/* login action */
router.post('/login', function (req, res) {
  models.User.getUserByEmail(req.body.email, function (user) {
    if (user) {
      user.comparePassword(req.body.password, function (isMatch) {
        if (isMatch) {
          var usr = {
            id: user.id,
            username: user.name,
            role: user.role,
            email: user.email
          }
          var token = jwt.sign(usr, 'hydroponic', {
            expiresIn: 300000
          });
          res.json({
            success: true,
            data: {
              name: user.name,
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

/* update action*/
router.put('/update', authenticate(), function (req, res) {

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

/* change pass action*/
router.put('/changepass', authenticate(), function (req, res) {
  models.User.getUserById(req.user.id, function (user) {
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
          html: '<p> Mật khẩu hiện tại của bạn là <strong>' + newPass + '</strong>. Bạn phải <a href="http://' + domain + '/login">đăng nhập</a> và thực hiện đổi mật khẩu để đảm bảo tính bảo mật cho tài khoản của bạn. </p>'
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

/* ensure authentication */
router.get('/verifytoken', function (req, res) {

  console.log(req.headers.token)

  jwt.verify(req.headers.token, secretKey, function (err, decoded) {
    if (err) {
      res.json({
        success: false,
        message: err
      });
    } else {
      res.json({
        success: true,
        data: decoded,
        message: 'Verify success !'
      });
    }
  })
})

/*only admin can get all users */
router.get('/all', [authenticate(), acl.middleware(2, utils.getUserId)], function (req, res) {
  models.User.getAllUser(function (result) {
    var listUser = [];

    result.forEach(function (user) {
      listUser.push(user.dataValues);
    });

    res.json({
      success: true,
      data: listUser,
      message: 'Get all user success!'
    })
  })
})

/* only admin can delete user */
router.delete('/delete', [authenticate(), acl.middleware(2, utils.getUserId)], function (req, res) {
  models.User.deleteUser(req.query.userId, function (success) {
    if (success) {
      res.json({
        success: true,
        message: 'User is deleted!'
      })
    } else {
      res.json({
        success: false,
        message: 'User cannot be deleted!'
      })
    }
  })
})

/* only admin can access other users info */
router.get('/detail', [authenticate(), acl.middleware(2, utils.getUserId)], function (req, res) {
  models.User.getUserById(req.query.userId, function (result) {
    if (result) {

      res.json({
        success: true,
        data: result.dataValues,
        message: 'Get user info success!'
      })
    } else {
      res.json({
        success: false,
        message: 'User does not exist!'
      })
    }
  })
})

/* only admin can update user's role */
router.put('/updaterole', [authenticate(), acl.middleware(2, utils.getUserId)], function (req, res) {
  models.User.getUserById(req.body.id, function (user) {
    if (user) {

      acl.removeUserRoles(req.body.id, user.dataValues.role, function (err) {

        if (err) {
          res.json({
            success: false,
            message: err
          })
        } else {

          user.updateRole(req.body.newRole, function () {

            acl.addUserRoles(req.body.id, req.body.newRole, function (err) {
              if (err) {

                res.json({
                  success: false,
                  message: err
                })
              } else {

                res.json({
                  success: true,
                  message: 'Update role success!'
                })
              }
            });
          })
        }
      });

    } else {
      res.json({
        success: false,
        message: 'User does not exist!'
      })
    }
  })
})
module.exports.authenticate = authenticate;
module.exports.router = router;
module.exports.acl = acl;
