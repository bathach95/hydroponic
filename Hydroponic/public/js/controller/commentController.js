controller.controller('CommentCtrl', function($scope, $window, $stateParams, CommentService, flash){

    /* load all comment by article's id */
    CommentService.getCommentsByArticleId($stateParams.id).then(function(result){
        if(result.data.success){
            $scope.commentList = result.data.data;
        }
    })

    /* add new comment */
    $scope.comment = {};

    $scope.postComment = function (articleId) {
        $scope.comment.ArticleId = articleId;

        if ($scope.comment.content && ($scope.comment.content.length > 30)) {
            CommentService.postComment($scope.comment).then(function(result){
                if(result.data.success){
                    flash.success = result.data.message;
                    bootbox.alert(result.data.message, function(){
                        $window.location.reload();
                    })
                } else {
                    flash.error = result.data.message;
                }
            })
        } else {
            flash.error = 'Content must be more than 30 characters';
        }
    }
})