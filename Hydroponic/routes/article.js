var express = require('express');
var router = express.Router();
var models = require('../models');
var user = require('./user.js');

router.get('/all', function (req, res) {
    models.Article.getAllArticle(function (result) {
        var articleList = [];

        result.forEach(function (element) {
            articleList.push(element.dataValues)
        });

        res.json({
            success: true,
            data: articleList,
            message: 'Get all articles success!'
        })
    })
})

router.get('/one', function (req, res) {
    models.Article.getArticleById(req.query.id, function (result) {

        if (result) {
            var article = result.dataValues;

            // get author's name of article

            models.User.getUserById(article.UserId, function (author) {
                if (author) {
                    article.author = author.name;
                } else {
                    article.author = null;
                }

                res.json({
                    success: true,
                    data: article,
                    message: 'Get article success!'
                })
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

module.exports.router = router;