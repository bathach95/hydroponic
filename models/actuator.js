"use strict";

module.exports = function(sequelize, DataTypes) {
  var Actuator = sequelize.define('Actuator', {
    name: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    type: {
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
      deleteActuator : function(name, callback){
        var query = {
          where: {
            name: name
          }
        }
        Actuator.destroy(query).then(callback);
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
