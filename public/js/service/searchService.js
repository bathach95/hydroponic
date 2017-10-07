service.service('SearchService', function($http){

    this.search = function(searchData){
        return $http.get('/crop/search', {
            params: searchData
        })
    }
})