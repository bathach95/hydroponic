"use strict";

module.exports = function(sequelize, DataTypes) {
  var Schedule = sequelize.define('Schedule', {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    turnonevery: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    timefrom: {
      type: DataTypes.DATE,
      allowNull: false
    },
    timeto: {
      type: DataTypes.DATE,
      allowNull: false
    },
    delaytime: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    lasttime: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    classMethods: {
      createSchedule: function(newSchedule, callback){
        Schedule.create(newSchedule).then(callback);
      },
      // association N:M with User
      associate: function(models){
      }
    },
    tableName: 'Schedule'
  });
  return Schedule;
};
