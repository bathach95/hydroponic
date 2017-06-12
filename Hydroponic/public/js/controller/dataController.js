
controller.controller('DataCtrl', function($http, $routeParams, $rootScope, $scope, DataService, GetTimeService, DataStatusService) {
  $scope.deviceMac = $routeParams.devicemac;
  $scope.cropId = $routeParams.cropid;

  DataService.getNewestDataByCropId($scope.cropId).then(function(result) {
    if (result.data) {

      $scope.data = result.data;
      var dateTime = GetTimeService.getDateTime(result.data.createdAt);
      $scope.data.date = dateTime.date;
      $scope.data.time = dateTime.time;

      // status of data
      $scope.threshold = $rootScope.threshold;
      var status = DataStatusService.getStatus($scope.data, $scope.threshold);
      $scope.badStatus = status.badStatus;
      $scope.status = status.status;
    }

  })
});


controller.controller('AllLogCtrl', function($http, $routeParams, $scope, ThresholdService, DataService, GetTimeService, DataStatusService) {
  // get threshold to compare
  ThresholdService.getNewestThresholdByCropId($routeParams.cropid).then(function(result) {
    $scope.threshold = result.data;
  });
  //
  DataService.getAllData($routeParams.cropid).then(function(result) {
    $scope.data = result.data;
    $scope.data.forEach(function(item) {
      var dateTime = GetTimeService.getDateTime(item.createdAt);
      item.date = dateTime.date;
      item.time = dateTime.time;
      //----status----
      var status = DataStatusService.getStatus(item, $scope.threshold);
      item.badStatus = status.badStatus;
      item.status = status.status;
      //--------------
    });
  });
});
