"use strict";

module.exports = function(sequelize, DataTypes) {
  var Comment = sequelize.define('Comment', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    classMethods: {
      createComment: function(newComment, callback){
        Comment.create(newComment).then(callback);
      },
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
      getCommentsByArticleId: function(User, articleId, callback){
        var query = {
          where: {
            ArticleId: articleId
          },
          order: [['createdAt', 'ASC']],
          include: [{
            model: User,
            attributes: ['name', 'email']
          }]
        }
        Comment.findAll(query).then(callback);
      },
      deleteComment: function(id, callback){
        var query = {
          where: {
            id: id
          }
        };

        Comment.destroy(query).then(callback);
      },
      associate: function(models){
        Comment.belongsTo(models.User)
      }
    },
    tableName: 'Comment'
  });
  return Comment;
};
