service.service('ArticleService', function($http){

    this.getAllArticles = function(){
        return $http.get('/article/all');
    }

    this.getArticleById = function(articleId){
        return $http.get('/article/one', {
            params: {
                id: articleId
            }
        });
    }

    this.postArticle = function(article){
        return $http.post('/article/add', article);
    }
})