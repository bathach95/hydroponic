"use strict";

module.exports = function(sequelize, DataTypes) {
  var Crop = sequelize.define('Crop', {
    treetype: {
      type: DataTypes.STRING,
      allowNull: false
    },
    startdate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    closedate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    classMethods: {
      createClub: function(newClub){
        Crop.create(newClub);
      },
      getClubByName: function(name, callback){
        var query = {
          where: {
            name: name
          }
        };
        Crop.findOne(query).then(callback);
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
        Crop.findAll(query).then(callback);
      },
      associate: function(models){
        Crop.hasMany(models.Schedule);
        Crop.hasMany(models.Threshold);
        Crop.hasMany(models.Data);
      }
    },
    tableName: 'Crop'
  });
  return Crop;
};
