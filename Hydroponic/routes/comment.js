var express = require('express');
var router = express.Router();
var models = require('../models');
var user = require('./user.js');

router.get('/all', function (req, res) {
    models.Comment.getCommentsByArticleId(req.query.articleId, function(result){
        var commentList = [];
        result.forEach(function(element) {
            commentList.push(element.dataValues)
        });

        res.json({
            success: true,
            data: commentList,
            message: 'Get comments success!'
        })
    })
});

router.post('/add', user.authenticate(), function (req, res) {

    // check user is active or not. Only active user can comment
    models.User.getUserById(req.user.id, function (user) {
        if (user.dataValues.status) {
            var newComment = {
                content: req.body.content,
                ArticleId: req.body.ArticleId,
                UserId: req.user.id
            }

            models.Comment.createComment(newComment, function () {
                res.json({
                    success: true,
                    message: 'Your comment has been posted'
                })
            })
        } else {
            res.json({
                success: false,
                message: 'Your account has not activated yet! Please check your email!'
            })
        }
    })


});

module.exports.router = router;