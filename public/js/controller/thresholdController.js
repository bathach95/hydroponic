controller.controller('ThresholdCtrl', function($http, $window, $stateParams, $rootScope, $scope, ThresholdService, GetTimeService) {
  ThresholdService.getNewestThresholdByCropId($stateParams.cropid).then(function(result) {
    if (result.data.success) {

      $rootScope.threshold = result.data.data;
      $scope.threshold = result.data.data;
      var dateTime = GetTimeService.getDateTime(result.data.data.createdAt);
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

function reload(){
  $window.location.reload();
}
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
          setTimeout(reload, 2000);
        }

      });
    } else {
      $scope.editThresholdSuccess = false;
      $scope.editThresholdMessage = isEmpty.message;
    }
  }
});
