service.service('UserManagementService', function($http){
    this.getAllUser = function(){
        return $http.get('/user/all');
    }

    this.deleteUser = function(userId){
        return $http.delete('/user/delete', {
            params: userId
        })
    }

    this.getUserDetail = function(userId){
        return $http.get('/user/detail', {
            params: userId
        })
    }

    this.updateRole = function(user){
        return $http.put('/user/updaterole', user);
    }
})

service.service('ArticleManagementService', function($http){
    this.deleteArticle = function(articleId){
        return $http.delete('/article/delete', {
            params: articleId
        });
    }

    this.checkArticle = function(articleId){
        return $http.put('/article/check', articleId);
    }
})

service.service('CommentManagementService', function($http){
    this.deleteComment = function(commentId){
        return $http.delete('/comment/delete', {
            params: commentId
        })
    }
})