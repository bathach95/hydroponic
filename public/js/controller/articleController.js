controller.controller('ArticleCtrl', function ($scope, ArticleService) {
    $scope.articleList = [];
    $scope.all = [];
    ArticleService.getAllArticles().then(function (result) {
        if (result.data.success) {
            $scope.all = result.data.data;
            if ($scope.all.length >= 4)
            {
              for(var i = 0; i < 4; i++) {
                $scope.articleList.push($scope.all[i]);
              }
            }
            else {
              for(var i = 0; i < $scope.all.length; i++) {
                $scope.articleList.push($scope.all[i]);
              }
            }
        }
    })
    $scope.loadMore = function() {
      var last = $scope.articleList.length;
      if (last <= $scope.all.length - 4)
      {
        for(var i = 1; i <= 4; i++) {
          $scope.articleList.push($scope.all[last + i - 1]);
        }
      }
      else {
        if (last < $scope.all.length)
        {
          for(var i = 1; i <= $scope.all.length - last; i++) {
            $scope.articleList.push($scope.all[last + i - 1]);
          }
        }
      }
    };
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
