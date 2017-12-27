controller.controller('CommentCtrl', function ($scope, $state, $window, $stateParams, CommentService, CommentManagementService, flash) {
    $scope.commentList = [];
    $scope.all = [];
    /* load all comment by article's id */
    CommentService.getCommentsByArticleId($stateParams.id).then(function (result) {
        if (result.data.success) {
          $scope.all = result.data.data;
          if ($scope.all.length >= 4)
          {
            for(var i = 0; i < 4; i++) {
              $scope.commentList.push($scope.all[i]);
            }
          }
          else {
            for(var i = 0; i < $scope.all.length; i++) {
              $scope.commentList.push($scope.all[i]);
            }
          }
        }
    })
    $scope.loadMore = function() {
      var last = $scope.commentList.length;
      if (last <= $scope.all.length - 4)
      {
        for(var i = 1; i <= 4; i++) {
          $scope.commentList.push($scope.all[last + i - 1]);
        }
      }
      else {
        if (last < $scope.all.length)
        {
          for(var i = 1; i <= $scope.all.length - last; i++) {
            $scope.commentList.push($scope.all[last + i - 1]);
          }
        }
      }
    };

    /* add new comment */
    $scope.comment = {};

    $scope.postComment = function (articleId) {
        $scope.comment.ArticleId = articleId;

        if ($scope.comment.content) {
            CommentService.postComment($scope.comment).then(function (result) {
                if (result.data.success) {
                    flash.success = result.data.message;
                    $state.reload();
                } else {
                    flash.error = result.data.message;
                }
            })
        } else {
            flash.error = 'Content must be more than 30 characters';
        }
    }

    $scope.deleteComment = function(id, index){

        bootbox.confirm('Do you want to delete this comment ? ', function(yes){
            if (yes){
                CommentManagementService.deleteComment({commentId: id}).then(function(result){
                    if (result.data.success){
                        $scope.commentList.splice(index, 1);
                        flash.success = result.data.message;
                    } else {
                        flash.error = result.data.message;
                    }
                })
            }
        })

    }
})
