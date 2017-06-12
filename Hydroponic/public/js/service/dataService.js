service.service('DataService', function($http) {
    this.getNewestDataByCropId = function(cropId) {
        return $http.get('/data/newest', {
            params: {
                cropId: cropId
            }
        })
    }

    this.getAllData = function(cropId) {
        return $http.get('/data/all', {
            params: {
                cropId: cropId
            }
        })
    }
});
