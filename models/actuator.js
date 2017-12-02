"use strict";

module.exports = function(sequelize, DataTypes) {
  var Actuator = sequelize.define('Actuator', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true
    },
    idonboard: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    instanceMethods: {
      updateStatus: function (newStatus, callback, err) {
        this.update({
          status: newStatus
        }).then(callback).catch(err);
      },
      updatePriority: function (newPriority, callback, err) {
        this.update({
          priority: newPriority
        }).then(callback).catch(err);
      }
    },
    classMethods: {

      getActuatorByIdOnboardAndDeviceMac: function(idonboard, deviceMac, callback, err){
        var query = {
          where: {
            idonboard: idonboard,
            DeviceMac: deviceMac
          }
        };

        Actuator.findOne(query).then(callback).catch(err);
      },

      getActuatorById: function (id, callback, err) {
        Actuator.findById(id).then(callback).catch(err);
      },
      createActuator: function(actuator, callback, err){
        Actuator.create(actuator).then(callback).catch(err);
      },
      getActuatorByName: function(name, callback, err){
        var query = {
          where: {
            name: name
          }
        };
        Actuator.findOne(query).then(callback).catch(err);
      },
      deleteActuator : function(id, callback, err){
        var query = {
          where: {
            id: id
          }
        }
        Actuator.destroy(query).then(callback).catch(err);
      },
      // association N:M with User
      associate: function(models){
        Actuator.hasMany(models.Schedule, {onDelete: 'cascade', hooks: true, onUpdate: 'cascade'});
        Actuator.belongsTo(models.Device);
      }
    },
    tableName: 'Actuator'
  });
  return Actuator;
};
