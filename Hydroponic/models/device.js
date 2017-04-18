"use strict";

module.exports = function(sequelize, DataTypes) {
  var Device = sequelize.define('Device', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    manufacturer: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    classMethods: {
      createClub: function(newClub){
        Device.create(newClub);
      },
      getClubByName: function(name, callback){
        var query = {
          where: {
            name: name
          }
        };
        Device.findOne(query).then(callback);
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
        Device.findAll(query).then(callback);
      },
      // association N:M with User
      associate: function(models){
        Device.hasMany(models.Crop);
      }
    },
    tableName: 'Device'
  });
  return Device;
};
