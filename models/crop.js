"use strict";

module.exports = function (sequelize, DataTypes) {
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
      type: DataTypes.STRING,
      allowNull: false
    },
    share: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    reporttime: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {

      instanceMethods: {
        updateShare: function (newShare, callback) {
          this.update({
            share: newShare
          }).then(callback);
        }
      },
      classMethods: {
        createCrop: function (crop, callback) {
          Crop.create(crop).then(callback);
        },
        deleteCrop: function (cropId, callback) {
          var query = {
            where: {
              id: cropId
            }
          }

          Crop.destroy(query).then(callback);
        },
        getNewestRunningCropByDeviceMac: function (deviceMac, callback) {
          var query = {
            where: {
              DeviceMac: deviceMac,
              status: 'running'
            },
            order: [['closedate', 'DESC']]
          }

          Crop.findOne(query).then(callback);
        },
        getOldestPendingCropByDeviceMac: function (deviceMac, callback) {
          var query = {
            where: {
              DeviceMac: deviceMac,
              status: 'pending'
            },
            order: [['startdate', 'ASC']]
          }

          Crop.findOne(query).then(callback);
        },
        getCropByName: function (cropName, deviceMac, callback) {
          var query = {
            where: {
              name: cropName,
              DeviceMac: deviceMac
            }
          }

          Crop.findOne(query).then(callback);
        },
        getCropById: function (id, callback) {
          Crop.findById(id).then(callback);
        },
        // get all crop with tree name like %name%
        getCropsByTree: function (tree, callback) {
          var str = '%' + tree + '%';
          var query = {
            where: {
              treetype: {
                $like: str
              },
              share: true
            }
          };
          Crop.findAll(query).then(callback);
        },
        getCropByMonth: function(month, callback){
          var query = 'SELECT * FROM "Crop" WHERE EXTRACT(MONTH FROM startdate) = :month'
          sequelize.query(query,
          {replacements: { month: month}, type: sequelize.QueryTypes.SELECT }
        ).then(callback)
        },
        associate: function (models) {
          Crop.hasMany(models.Schedule, { onDelete: 'cascade', hooks: true, onUpdate: 'cascade' });
          Crop.hasMany(models.Threshold, { onDelete: 'cascade', hooks: true, onUpdate: 'cascade' });
          Crop.hasMany(models.Data, { onDelete: 'cascade', hooks: true, onUpdate: 'cascade' });
        }
      },
      tableName: 'Crop'
    });
  return Crop;
};

