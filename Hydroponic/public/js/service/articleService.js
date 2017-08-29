service.service('ArticleService', function($http){

    this.getAllArticles = function(){
        return $http.get('/article');
    }

    this.postArticle = function(article){
        return $http.post('/article/post', article);
    }
})