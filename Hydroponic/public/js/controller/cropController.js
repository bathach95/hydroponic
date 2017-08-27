controller.controller('CropCtrl', function($http, $stateParams, $scope, $window, CropService, GetTimeService) {

  CropService.getCropById($stateParams.cropid).then(function(result) {
    $scope.crop = result.data;

    $scope.cropEdit = {
      DeviceMac: $stateParams.devicemac,
      id: $stateParams.cropid,
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
