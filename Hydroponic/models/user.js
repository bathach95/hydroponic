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
      primaryKey: true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    instanceMethods:{
      updatePassword: function(newPass, callback){
        var self = this;
        bcrypt.genSalt(10, function(err,salt){
          bcrypt.hash(newPass, salt, function(err, hashed){
            self.update({
              password: hashed
            }).then(callback);
          });
        });
      },
      comparePassword: function(password, callback){
        bcrypt.compare(password, this.password, function(err, isMatch){
          if(err) {
            throw err;
          }
          callback(isMatch);
        });
      }
    },
    classMethods: {
      createUser: function(newUser, callback){
        bcrypt.genSalt(10, function(err,salt){
          bcrypt.hash(newUser.password, salt, function(err, hash){
            newUser.password = hash;
            User.create(newUser).then(callback);
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
