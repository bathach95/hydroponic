"use strict";

module.exports = function(sequelize, DataTypes) {
  var Review = sequelize.define('Review', {
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    content: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    classMethods: {
      createReview: function(review, callback){
        Review.create(review).then(callback);
      },
      getReviewsByCropId: function(cropId, callback, models){
        var query = {
          include: models.User,
          where: {
            CropId: cropId
          },
          order: [['createdAt', 'DESC']]
        };
        Review.findAll(query).then(callback);
      },
      getReviewsByUserId: function(userId, callback){
        var query = {
          where: {
            UserId: userId
          },
          order: [['createdAt', 'DESC']]
        }
        Data.findAll(query).then(callback);
      },
      associate: function(models){
        Review.belongsTo(models.Crop);
        Review.belongsTo(models.User);
      }
    },
    tableName: 'Review'
  });
  return Review;
};
