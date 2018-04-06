
"use strict";

module.exports = function(sequelize, DataTypes) {
  var Schedule = sequelize.define('Schedule', {
    starttime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endtime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    delaytime: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    intervaltime: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    classMethods: {
      // association N:M with User
      associate: function(models){
        Schedule.belongsTo(models.Actuator);
        Schedule.belongsTo(models.Crop);
      },
      createSchedule: function(newSchedule, callback){
        Schedule.create(newSchedule).then(callback);
      },
      getScheduleByCropId: function(cropId, callback, err, models){
        var query = {
          include: models.Actuator,
          where: {
            CropId: cropId
          },
          order: [['starttime', 'ASC']]
        }
        Schedule.findAll(query).then(callback).catch(err);
        //sequelize.query('SELECT * FROM Schedule, Actuator WHERE Schedule.name = Actuator.name').success(callback);
      },
      getScheduleByCropIdAndActuatorId: function(cropId, actuatorId, callback, err) {
        var query = {
          where: {
            CropId: cropId,
            ActuatorId: actuatorId
          },
          order: [['starttime', 'ASC']]
        };
        Schedule.findAll(query).then(callback).catch(err);
      },
      deleteScheduleSettingById: function(scheduleId, callback, err){
        var query = {
          where: {
            id: scheduleId
          }
        }
        Schedule.destroy(query).then(callback).catch(err);
      }
    },
    tableName: 'Schedule'
  });
  return Schedule;
};
