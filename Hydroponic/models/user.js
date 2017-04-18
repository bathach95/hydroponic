"use strict";
var bcrypt = require('bcryptjs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      createUser: function(newUser){
        bcrypt.genSalt(10, function(err,salt){
          bcrypt.hash(newUser.password, salt, function(err, hash){
            newUser.password = hash;
            User.create(newUser);
          });
        });
      },
      getUserByUsename: function(username, callback){
        var query = {
          where: {
            username: username
          }
        };
        User.findOne(query).then(callback);
      },
      getUserByEmail: function(email, callback){
        var query = {
          where: {
            email: email
          }
        };
        User.findOne(query).then(callback);
      },
      getUserById: function(id, callback){
        User.findById(id, callback);
      },
      comparePassword: function(password, hashed, callback){
        bcrypt.compare(password, hashed, function(err, isMatch){
          if(err) throw err;
          callback(isMatch);
        });
      },
      associate: function(models){
        User.hasMany(models.Thread);
        User.hasMany(models.Comment);
        User.hasMany(models.Device);
      }
    },
    tableName: 'User'
  });
  return User;
};
