controller.controller('ArticleCtrl', function ($scope, ArticleService) {
    ArticleService.getAllArticles().then(function (result) {
        if (result.data.success) {
            $scope.articleList = result.data.data;
        }
    })
})

controller.controller('SingleArticleCtrl', function ($scope, $state, $stateParams, ArticleService, ArticleManagementService, flash) {

    ArticleService.getArticleById($stateParams.id).then(function (result) {
        if (result.data.success) {
            $scope.article = result.data.data;
        } else {
            flash.error = result.data.message;
        }
    })

    $scope.checkArticle = function(articleId, check){

        bootbox.confirm('Do you want to ' + (check==true? 'verify': 'unverify') +' this article ?', function(yes){
            if (yes){
                var article = {
                    articleId: articleId,
                    checked: check
                }
                ArticleManagementService.checkArticle(article).then(function(result){
                    if (result.data.success){
                        $state.reload();
                        flash.success = result.data.message;
                    } else {
                        flash.error = result.data.message;
                    }
                })
            }
        })

    }

})

controller.controller('WriteArticleCtrl', function ($scope, $cookies, $state, ArticleService, flash) {

    $scope.article = {};

    $scope.postArticle = function () {
        if ($scope.article.content && $scope.article.title) {
            ArticleService.postArticle($scope.article).then(function (result) {
                if (result.data.success) {
                    flash.success = result.data.message;
                    $state.go('article');
                } else {
                    flash.error = result.data.message;
                }
            })
        } else {
            flash.error = 'Content must be more than 100 characters or empty title!';
        }
    }
})
