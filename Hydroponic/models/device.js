"use strict";

module.exports = function(sequelize, DataTypes) {
  var Device = sequelize.define('Device', {
    mac: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      createDevice: function(device, callback, err){
        Device.create(device).then(callback).catch(err);
      },
      getDeviceByMac: function(mac, callback, err){
        var query = {
          where: {
            mac: mac
          }
        };
        Device.findOne(query).then(callback).catch(err);
      },
      getDevicesByUserEmail: function(email, callback, err){
        var query = {
          where: {
            UserEmail: email
          }
        }
        Device.findAll(query).then(callback).catch(err);
      },
      // association N:M with User
      associate: function(models){
        Device.hasMany(models.Crop);
      }
    },
    tableName: 'Device'
  });
  return Device;
};
