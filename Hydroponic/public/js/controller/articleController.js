controller.controller('ArticleCtrl', function () {
    //TODO: load add article from database 
})

controller.controller('WriteArticleCtrl', function ($scope, flash) {
    //TODO: get content and post to server

    $scope.content = '';

    $scope.postArticle = function () {
        if ($scope.content !== '') {
            console.log($scope.content);
        } else {
            flash.error = 'Empty content!';
        }
    }
})