"use strict";

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      getCommentsByContent: function(content, callback){
        var str = '%' + content + '%';
        var query = {
          where: {
            content: {
              $like: str
            }
          }
        };
        Comment.findAll(query).then(callback);
      },
      getCommentById: function(id, callback){
        Comment.findById(id, callback);
      }
      // associate: function(models){
      //
      // }
    },
    tableName: 'Comment'
  });
  return Comment;
};
