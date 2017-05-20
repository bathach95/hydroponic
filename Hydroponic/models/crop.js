"use strict";

module.exports = function(sequelize, DataTypes) {
  var Crop = sequelize.define('Crop', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
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
    reporttime: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    classMethods: {
      createCrop: function(crop, callback){
        Crop.create(crop).then(callback);
      },
      deleteCrop: function(cropId, callback){
        var query = {
          where: {
            id: cropId
          }
        }

        Crop.destroy(query).then(callback);
      },
      getCropsByDeviceMac: function(deviceMac, callback){
        var query = {
          where: {
            DeviceMac: deviceMac
          },
          order: [['closedate', 'DESC']]
        };
        Crop.findAll(query).then(callback);
      },
      getCropById: function(id, callback){
        Crop.findById(id).then(callback);
      },
      associate: function(models){
        Crop.hasMany(models.Schedule, {onDelete: 'cascade', hooks: true, onUpdate: 'cascade'});
        Crop.hasMany(models.Threshold, {onDelete: 'cascade', hooks: true, onUpdate: 'cascade'});
        Crop.hasMany(models.Data, {onDelete: 'cascade', hooks: true, onUpdate: 'cascade'});
      }
    },
    tableName: 'Crop'
  });
  return Crop;
};
