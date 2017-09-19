var express = require('express');
var router = express.Router();
var models = require('../models');
var user = require('./user.js');
var utils = require('./utils.js')

router.get('/all', function (req, res) {
    models.Article.getAllArticle(models.User, function (result) {
        var articleList = [];

        result.forEach(function (element) {
            articleList.push(element.dataValues)
        });

        res.json({
            success: true,
            data: articleList,
            message: 'Get all articles success!'
        })
    }, function(err){
        res.json({
            success: false,
            message: err
        })
    })
})

router.get('/one', function (req, res) {
    models.Article.getArticleById(models.User, req.query.id, function (result) {

        if (result) {
            var article = result.dataValues;

            res.json({
                success: true,
                data: article,
                message: 'Get article success!'
            })
            

        } else {
            res.json({
                success: false,
                message: 'Article dose not exist!'
            })
        }
    })
})

router.post('/add', user.authenticate(), function (req, res) {

    // check user is active or not. Only active user can post article
    models.User.getUserById(req.user.id, function (user) {

        if (user.dataValues.status) {
            var article = {
                UserId: req.user.id,
                title: req.body.title,
                content: req.body.content
            }

            models.Article.createArticle(article, function (result) {
                res.json({
                    success: true,
                    message: 'Post article success!'
                })
            })
        } else {
            res.json({
                success: false,
                message: 'Your account has not activated yet! Please check your email'
            })
        }
    })



})

/* only mod and admin can delete article */
router.delete('/delete',[user.authenticate(), user.acl.middleware(2, utils.getUserId)], function(req, res){
    models.Article.deleteArticle(req.query.articleId, function(success){
        if(success){
            res.json({
                success: true,
                message: 'Delete article success !'
            })
        } else {
            res.json({
                success: false,
                message: 'Cannot delete this article !'
            })
        }
    })
})

/* only mod and admin can check article */
router.put('/check', [user.authenticate(), user.acl.middleware(2, utils.getUserId)], function(req, res){
    models.Article.getArticleById(req.body.articleId, function(article){
        if (article){
            article.updateChecked(req.body.checked, req.user.id, function(){
                var message = req.body.checked ? 'Article was checked !' : 'Article was unchecked !';

                res.json({
                    success: true,
                    message: message
                })
            })
        } else {
            res.json({
                success: false,
                message: 'Article does not exist !'
            })
        }
    })
})

module.exports.router = router;