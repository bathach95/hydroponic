var express = require('express');
var router = express.Router();
var models = require('../models');
var user = require('./user.js');

router.get('/', function(req, res){
    // TODO: get all article from database
})

router.post('/post', user.authenticate(), function(req, res){
    var article = {
        UserId: req.body.userid,
        title: req.body.title,
        content: req.body.content
    }

    models.Article.createArticle(article, function(result){
        res.json({
            success: true,
            message: 'Post article success!'
        })
    })
})

module.exports.router = router;