
controller.controller('DataCtrl', function ($http, $stateParams, $rootScope, $scope, DataService, GetTimeService, DataStatusService, ThresholdService) {
  $scope.deviceMac = $stateParams.devicemac;
  $scope.cropId = $stateParams.cropid;

  DataService.getNewestDataByCropId($scope.cropId).then(function (dataResult) {
    if (dataResult.data.success) {

      $scope.data = dataResult.data.data;
      // status of data

      ThresholdService.getNewestThresholdByCropId($scope.cropId).then(function(thresholdResult) {
      var status = DataStatusService.getStatus(dataResult.data.data, thresholdResult.data.data);
      $scope.threshold = thresholdResult.data.data;
      $scope.badStatus = status.badStatus;
      $scope.status = status.status;
      });
    }
  })
});

controller.controller('HomePageDataCtrl', function ($http, $stateParams, $rootScope, $scope, DataService, GetTimeService, DataStatusService, DeviceService, ThresholdService) {

var runningDevicesData = []
  if ($scope.userLogin)
  {
    new Promise(function(resolve, reject){
      DeviceService.getRunningDevice().then(function(result){
        if (result.data.success)
        {
          Promise.all(result.data.data.map(function(item){
            return new Promise(function(resolve, reject){
              ThresholdService.getNewestThresholdByCropId(item.crop.id).then(function(result) {
                var status = DataStatusService.getStatus(item.data, result.data.data);
                runningDevicesData.push({devicecropdata: item, status: status});

                resolve(status);
                });
            });
          })).then(function(result)
          {
            //resolve(result);
          })
        }
        else
        {
            console.log("Not OK!!");
        };
      }).then(function(result){
        resolve(result);
      })
    }).then(function(){
      $scope.runningDevicesData = runningDevicesData;
      console.log(runningDevicesData);
    })
  }
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
