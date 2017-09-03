service.service('CommentService', function($http){

    this.getCommentsByArticleId = function(articleId){
        return $http.get('/comment/all', {
            params: {
                articleId: articleId
            }
        });
    }

    this.postComment = function(comment){
        return $http.post('/comment/add', comment);
    }
})