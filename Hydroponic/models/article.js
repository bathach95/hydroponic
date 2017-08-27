"use strict";

module.exports = function(sequelize, DataTypes) {
  var Article = sequelize.define('Article', {
    title: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    checked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    checkedby: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    classMethods: {
      // get all articles with title like %title%
      getArticlesByTitle: function(title, callback){
        var str = '%' + title + '%';
        var query = {
          where: {
            title: {
              $like: str
            }
          }
        };
        Article.findAll(query).then(callback);
      },
      getArticleById: function(id, callback) {
        Article.findById(id).then(callback);
      },
      associate: function(models){
        Article.hasMany(models.Comment, {onDelete: 'cascade', hooks: true, onUpdate: 'cascade'});
      }
    },
    tableName: 'Article'
  });
  return Article;
};
