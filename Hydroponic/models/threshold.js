"use strict";

module.exports = function(sequelize, DataTypes) {
  var Threshold = sequelize.define('Threshold', {
    time: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ph: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ppm: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    classMethods: {
      createClub: function(newClub){
        Threshold.create(newClub);
      },
      getClubByName: function(name, callback){
        var query = {
          where: {
            name: name
          }
        };
        Threshold.findOne(query).then(callback);
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
        Threshold.findAll(query).then(callback);
      },
      // association N:M with User
      associate: function(models){
      }
    },
    tableName: 'Threshold'
  });
  return Threshold;
};
