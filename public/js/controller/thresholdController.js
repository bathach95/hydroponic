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
        lightLower: $scope.threshold.lightLower,
        lightUpper: $scope.threshold.lightUpper
      }
    }
  });

  // add new threshold
  $scope.addThreshold = function () {
    $("#editThresholdModal").modal('hide');
    var isErr = ThresholdService.checkDataAddThreshold($scope.newThreshold);
    if (isErr.isErr){
      flash.error = isErr.message;
    } else {
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
  
      }).catch(function(err){
        console.log(err);
        flash.error = "Cannot add threshold";
      });
    }

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
          lightLower: $scope.threshold.lightLower,
          lightUpper: $scope.threshold.lightUpper
        }
      }
    });
  }
});
