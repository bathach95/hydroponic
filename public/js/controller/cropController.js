controller.controller('CropCtrl', function($http, $routeParams, $scope, $window, CropService, GetTimeService) {

  CropService.getCropById($routeParams.cropid).then(function(result) {
    $scope.crop = result.data;
    var startDate = GetTimeService.getDateTime($scope.crop.startdate);
    $scope.crop.startdate = startDate.date + " " + startDate.time;
    var closeDate = GetTimeService.getDateTime($scope.crop.closedate);
    $scope.crop.closedate = closeDate.date + " " + closeDate.time;

    $scope.cropEdit = {
      DeviceMac: $routeParams.devicemac,
      id: $routeParams.cropid,
      name: $scope.crop.name,
      treetype: $scope.crop.treetype,
      startdate: new Date($scope.crop.startdate),
      closedate: new Date($scope.crop.closedate),
      reporttime: $scope.crop.reporttime
    }

  })

  function reload(){
    $window.location.reload();
  }


  $scope.editCrop = function() {
    CropService.editCrop($scope.cropEdit).then(function(result) {
      $scope.editSuccess = result.data.success;
      $scope.editMessage = result.data.message;
      if (result.data.success){
        setTimeout(reload, 1000);
      }
    }).catch(function(err) {
      console.log(err);
    })
  }

});
