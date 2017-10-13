"use strict";

module.exports = function(sequelize, DataTypes) {
  var Threshold = sequelize.define('Threshold', {
    // time: {
    //   type: DataTypes.DATE,
    //   allowNull: false
    // },
    phLower: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    phUpper: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ppmLower: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    ppmUpper: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    humidityLower: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    humidityUpper: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    temperatureLower: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    temperatureUpper: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    classMethods: {
      createThreshold: function(threshold, callback, err){
        Threshold.create(threshold).then(callback).catch(err);
      },
      getNewestThresholdByCropId: function(cropId, callback){
        var query = {
          where: {
            CropId: cropId
          },
          order: [['createdAt', 'DESC']]
        };
        Threshold.findOne(query).then(callback);
      },
      associate: function(models){
      }
    },
    tableName: 'Threshold'
  });
  return Threshold;
};
