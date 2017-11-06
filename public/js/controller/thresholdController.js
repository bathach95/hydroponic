controller.controller('ThresholdCtrl', function ($http, $state, $stateParams, $rootScope, $scope, ThresholdService, flash) {
  ThresholdService.getNewestThresholdByCropId($stateParams.cropid).then(function (result) {
    if (result.data.success) {

      $rootScope.threshold = result.data.data;
      $scope.threshold = result.data.data;

      $scope.newThreshold = {
        CropId: $stateParams.cropid,
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
  $scope.addThreshold = function () {
    $("#editThresholdModal").modal('hide');
    ThresholdService.addThreshold($scope.newThreshold).then(function (result) {
      // if success, update view
      if (result.data.success) {
        flash.success = result.data.message;
        bootbox.alert("Edit threshold success !", function () {
          $state.reload();
        });
      }
      else {
        flash.error = result.data.message;
      }

    });
  }
});

controller.controller('HomePageThresholdCtrl', function ($http, $state, $stateParams, $rootScope, $scope, ThresholdService, flash) {
  if ($scope.userLogin) {
    ThresholdService.getNewestThresholdByCropId($stateParams.cropid).then(function (result) {
      if (result.data.success) {
        $scope.threshold = result.data.data;

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
