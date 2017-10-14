"use strict";

module.exports = function(sequelize, DataTypes) {
  var Device = sequelize.define('Device', {
    mac: {
      type: DataTypes.STRING,
      primaryKey: true
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
    instanceMethods: {
      updateStatus: function (newStatus, callback) {
        this.update({
          status: newStatus
        }).then(callback);
      }
    },
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
      deleteDevice : function(mac, callback){
        var query = {
          where: {
            mac: mac
          }
        }
        Device.destroy(query).then(callback);
      },
      // association N:M with User
      associate: function(models){
        Device.hasMany(models.Crop, {onDelete: 'cascade', hooks: true, onUpdate: 'cascade'});
        Device.belongsTo(models.User);
      }
    },
    tableName: 'Device'
  });
  return Device;
};
