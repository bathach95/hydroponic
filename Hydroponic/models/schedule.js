"use strict";

module.exports = function(sequelize, DataTypes) {
  var Schedule = sequelize.define('Schedule', {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dateturnon: {
      type: DataTypes.DATE,
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
    timedelay: {
      type: DataTypes.CHAR,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
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
