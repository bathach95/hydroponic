service.service('ThresholdService', function ($http) {
  this.getNewestThresholdByCropId = function (cropId) {
    return $http.get('/threshold/newest', {
      params: {
        cropId: cropId
      }
    })
  }

  this.checkDataAddThreshold = function (threshold) {
    var isErr = true;
    var message = '';
    if (threshold.temperatureLower > threshold.temperatureUpper
      || threshold.humidityLower > threshold.humidityUpper
      || threshold.ppmLower > threshold.ppmUpper
      || threshold.lightLower > threshold.lightUpper) {
      message = "Upper value must larger than lower value";
    } else {
      isErr = false;
    }
    return {
      isErr: isErr,
      message: message
    }
  }

  this.addThreshold = function (threshold) {
    return $http.post('/threshold/add', threshold);
  }
});
