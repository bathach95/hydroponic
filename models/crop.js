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
    },
    synchronized: {
      type: DataTypes.BOOLEAN,
      allowNull:false,
      defaultValue: true
    }
  }, {

      instanceMethods: {
        updateShare: function (newShare, callback) {
          this.update({
            share: newShare
          }).then(callback);
        },
        updateSynchronized: function (newSynchronized, callback) {
          this.update({
            synchronized: newSynchronized
          }).then(callback);
        },
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
        getCropsByTree: function (tree, callback, models) {
          var str = '%' + tree + '%';
          var query = {
            include: [{
              model: models.Device,
              include: [{
                model: models.User
              }]
            }],
            where: {
              treetype: {
                $iLike: str
              },
              share: true
            }
          };
          Crop.findAll(query).then(callback);
          /*var query = 'SELECT * FROM "Crop" WHERE LOWER(treetype) LIKE :tree';
          sequelize.query(query,
          {replacements: { tree: str}, type: sequelize.QueryTypes.SELECT }
        ).then(callback)*/
        },
        getCropByMonth: function(month, callback){
          var query = "SELECT \"Crop\".*, \"User\".\"name\" as username FROM ((\"Crop\" JOIN \"Device\" ON \"Crop\".\"DeviceMac\" = \"Device\".\"mac\") JOIN \"User\" ON \"User\".\"id\" = \"Device\".\"UserId\") WHERE EXTRACT(MONTH FROM startdate) = :month AND share = true";
          sequelize.query(query,
            {replacements: { month: month }, type: sequelize.QueryTypes.SELECT }
          ).then(callback)
        },
        getCropByBoth: function(tree, month, callback){
          var str = '%' + tree + '%';
          var query = "SELECT \"Crop\".*, \"User\".\"name\" as username FROM ((\"Crop\" JOIN \"Device\" ON \"Crop\".\"DeviceMac\" = \"Device\".\"mac\") JOIN \"User\" ON \"User\".\"id\" = \"Device\".\"UserId\") WHERE LOWER(treetype) LIKE :tree AND EXTRACT(MONTH FROM startdate) = :month AND share = true";
          sequelize.query(query,
            {replacements: { month: month, tree: str }, type: sequelize.QueryTypes.SELECT }
          ).then(callback)
        },
        associate: function (models) {
          Crop.hasMany(models.Schedule, { onDelete: 'cascade', hooks: true, onUpdate: 'cascade' });
          Crop.hasMany(models.Threshold, { onDelete: 'cascade', hooks: true, onUpdate: 'cascade' });
          Crop.hasMany(models.Data, { onDelete: 'cascade', hooks: true, onUpdate: 'cascade' });
          Crop.belongsTo(models.Device);
        }
      },
      tableName: 'Crop'
    });
  return Crop;
};
