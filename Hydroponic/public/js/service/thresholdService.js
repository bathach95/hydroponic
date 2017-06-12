service.service('ThresholdService', function($http) {
    this.getNewestThresholdByCropId = function(cropId) {
        return $http.get('/threshold/newest', {
            params: {
                cropId: cropId
            }
        })
    }

    this.checkDataEditThreshold = function(threshold){
      var isErr = true;
      var message = '';
      if (threshold.temperatureLower === null || threshold.temperatureUpper === null
          || threshold.humidityLower === null || threshold.humidityUpper === null
          || threshold.ppmLower === null || threshold.ppmUpper === null
          || threshold.phLower === null || threshold.phUpper === null){
            message = "You have to input all value";
          } else {
            isErr = false;
          }
      return {
        isErr: isErr,
        message: message
      }
    }

    this.addThreshold = function(threshold){
      return $http.post('/threshold/add', threshold);
    }
});
