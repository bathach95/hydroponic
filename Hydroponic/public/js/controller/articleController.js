controller.controller('ArticleCtrl', function ($scope, ArticleService) {
    //TODO: load add article from database 
})

controller.controller('WriteArticleCtrl', function ($scope, $cookies, $state, ArticleService, flash) {
    //TODO: get content and post to server

    $scope.article = {
        userid: $cookies.get('userid')
    };

    $scope.postArticle = function () {
        if ($scope.article.content && $scope.article.title) {
            ArticleService.postArticle($scope.article).then(function (result) {
                if (result.data.success) {
                    flash.success = result.data.message;
                    $state.go('article');
                }
            })
        } else {
            flash.error = 'Empty content or title!';
        }
    }
})