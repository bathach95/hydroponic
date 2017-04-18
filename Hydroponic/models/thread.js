"use strict";

module.exports = function(sequelize, DataTypes) {
  var Thread = sequelize.define('Thread', {
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      // get all threads with title like %title%
      getThreadsByTitle: function(title, callback){
        var str = '%' + title + '%';
        var query = {
          where: {
            title: {
              $like: str
            }
          }
        };
        Thread.findAll(query).then(callback);
      },
      getThreadById: function(id, callback) {
        Thread.findById(id).then(callback);
      },
      associate: function(models){
        Thread.hasMany(models.Comment);
      }
    },
    tableName: 'Thread'
  });
  return Thread;
};
