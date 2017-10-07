"use strict";

module.exports = function(sequelize, DataTypes) {
  var Schedule = sequelize.define('Schedule', {
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    actuatorid:{
      type: DataTypes.INTEGER,
      allowNull: false
    },
    turnonevery: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    timefrom: {
      type: DataTypes.TIME,
      allowNull: false
    },
    timeto: {
      type: DataTypes.TIME,
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
      getScheduleByCropId: function(cropId, callback, err){
        var query = {
          where: {
            CropId: cropId
          },
          order: [['timefrom', 'ASC']]
        }
        Schedule.findAll(query).then(callback).catch(err);
      },
      deleteScheduleByCropId: function(cropId, callback){
        var query = {
          where: {
            CropId: cropId
          }
        }
        Schedule.destroy(query).then(callback);
      },
      // association N:M with User
      associate: function(models){
      }
    },
    tableName: 'Schedule'
  });
  return Schedule;
};
