controller.controller('CommentCtrl', function ($scope, $state, $window, $stateParams, CommentService, CommentManagementService, flash) {

    /* load all comment by article's id */
    CommentService.getCommentsByArticleId($stateParams.id).then(function (result) {
        if (result.data.success) {
            $scope.commentList = result.data.data;
        }
    })

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