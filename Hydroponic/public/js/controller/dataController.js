
controller.controller('DataCtrl', function ($http, $stateParams, $rootScope, $scope, DataService, GetTimeService, DataStatusService) {
  $scope.deviceMac = $stateParams.devicemac;
  $scope.cropId = $stateParams.cropid;

  DataService.getNewestDataByCropId($scope.cropId).then(function (result) {
    if (result.data) {

      $scope.data = result.data;
      // status of data
      $scope.threshold = $rootScope.threshold;
      var status = DataStatusService.getStatus($scope.data, $scope.threshold);
      $scope.badStatus = status.badStatus;
      $scope.status = status.status;
    }

  })
});


controller.controller('AllLogCtrl', function ($http, $stateParams, $scope, ThresholdService, DataService, GetTimeService, DataStatusService, flash) {
  // get threshold to compare
  ThresholdService.getNewestThresholdByCropId($stateParams.cropid).then(function (result) {
    $scope.threshold = result.data;
  });
  //
  DataService.getAllData($stateParams.cropid).then(function (result) {

    if (result.data.success) {
      $scope.data = result.data.data;
      $scope.data.forEach(function (item) {
        //----status----
        var status = DataStatusService.getStatus(item, $scope.threshold);
        item.badStatus = status.badStatus;
        item.status = status.status;
        //--------------
      });
    } else {
      flash.error = result.data.message;
    }
  });
});
