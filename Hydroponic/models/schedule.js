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
      createClub: function(newClub){
        Schedule.create(newClub);
      },
      getClubByName: function(name, callback){
        var query = {
          where: {
            name: name
          }
        };
        Schedule.findOne(query).then(callback);
      },
      getClubById: function(id, callback){
        User.findById(id, callback);
      },
      getClubsByNation: function(nation, callback){
        var query = {
          where: {
            nation: nation
          }
        };
        Schedule.findAll(query).then(callback);
      },
      // association N:M with User
      associate: function(models){
      }
    },
    tableName: 'Schedule'
  });
  return Schedule;
};
