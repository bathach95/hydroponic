controller.controller('ThresholdCtrl', function($http, $window, $stateParams, $rootScope, $scope, ThresholdService, GetTimeService, flash) {
  ThresholdService.getNewestThresholdByCropId($stateParams.cropid).then(function(result) {
    if (result.data) {
      $rootScope.threshold = result.data;
      $scope.threshold = result.data;
      var dateTime = GetTimeService.getDateTime(result.data.createdAt);
      $scope.threshold.date = dateTime.date;
      $scope.threshold.time = dateTime.time;

      $scope.newThreshold = {
        temperatureLower: $scope.threshold.temperatureLower,
        temperatureUpper: $scope.threshold.temperatureUpper,
        humidityLower: $scope.threshold.humidityLower,
        humidityUpper: $scope.threshold.humidityUpper,
        ppmLower: $scope.threshold.ppmLower,
        ppmUpper: $scope.threshold.ppmUpper,
        phLower: $scope.threshold.phLower,
        phUpper: $scope.threshold.phUpper
      }
    }
  });

  // add new threshold
  $scope.addThreshold = function() {

    var isEmpty = ThresholdService.checkDataEditThreshold($scope.newThreshold);
    if (!isEmpty.isErr) {
      $scope.newThreshold.CropId = $stateParams.cropid;
      ThresholdService.addThreshold($scope.newThreshold).then(function(result) {
        $scope.editThresholdSuccess = result.data.success;
        $scope.editThresholdMessage = result.data.message;

        // if success, update view
        if (result.data.success){
          flash.success = result.data.message;
          $state.reload();
        }
        else {
          flash.error = result.data.message;
        }

      });
    } else {
      $scope.editThresholdSuccess = false;
      $scope.editThresholdMessage = isEmpty.message;
    }
  }
});

controller.controller('HomePageThresholdCtrl', function($http, $window, $stateParams, $rootScope, $scope, ThresholdService, GetTimeService) {
  if ($scope.userLogin)
  {
  ThresholdService.getNewestThresholdByCropId($stateParams.cropid).then(function(result) {
    if (result.data) {
      console.log(12345555);
      $rootScope.threshold = result.data;
      $scope.threshold = result.data;
      var dateTime = GetTimeService.getDateTime(result.data.createdAt);
      $scope.threshold.date = dateTime.date;
      $scope.threshold.time = dateTime.time;

      $scope.newThreshold = {
        temperatureLower: $scope.threshold.temperatureLower,
        temperatureUpper: $scope.threshold.temperatureUpper,
        humidityLower: $scope.threshold.humidityLower,
        humidityUpper: $scope.threshold.humidityUpper,
        ppmLower: $scope.threshold.ppmLower,
        ppmUpper: $scope.threshold.ppmUpper,
        phLower: $scope.threshold.phLower,
        phUpper: $scope.threshold.phUpper
      }
    }
  });
}
});
