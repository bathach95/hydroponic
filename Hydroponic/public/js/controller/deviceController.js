controller.controller('DeviceCtrl', function($http, $routeParams, $scope, $localStorage, DeviceService, CropService, GetTimeService) {

  $scope.deviceMac = $routeParams.mac;

  /* query all device data */
  DeviceService.getDeviceByMac($routeParams.mac).then(function(result) {
    $scope.device = result.data;
    var dateTime = GetTimeService.getDateTime($scope.device.createdAt);
    $scope.device.date = dateTime.date;
    $scope.device.time = dateTime.time;
  });
  /* end query device data */

  /* get all crops of device */
  CropService.getAllCrops($routeParams.mac).then(function(result) {
    $scope.cropList = result.data;
    $scope.cropList.forEach(function(item) {
      var startDateTime = GetTimeService.getDateTime(item.startdate);
      item.sdate = startDateTime.date;
      item.stime = startDateTime.time;

      var closeDateTime = GetTimeService.getDateTime(item.closedate);
      item.cdate = closeDateTime.date;
      item.ctime = closeDateTime.time;

      // check status of crop
      // if close date is after today, crop is running, otherwise crop has finished

    });
  });
  /* end get all crop of device */

  /* add new crop to device */

  $scope.newCrop = {
    DeviceMac: $routeParams.mac,
    name: '',
    type: '',
    treetype: '',
    startdate: '',
    closedate: '',
    reporttime: 0,
    status: true
  }
  $scope.addCrop = function() {
    var isEmpty = CropService.checkDataAddCrop($scope.newCrop);
    if (!isEmpty.isErr) {
      CropService.addCrop($scope.newCrop).then(function(result) {
        $scope.addCropMessage = result.data.message;
        $scope.addCropSuccess = result.data.success;
        if (result.data.success) {
          var sdate = $scope.newCrop.startdate.toString().split(' ');
          var cdate = $scope.newCrop.closedate.toString().split(' ');

          $scope.newCrop.sdate = sdate[1] + ' ' + sdate[2] + ' ' + sdate[3];
          $scope.newCrop.stime = sdate[4];
          $scope.newCrop.cdate = cdate[1] + ' ' + cdate[2] + ' ' + cdate[3];
          $scope.newCrop.ctime = cdate[4];
          CropService.getAllCrops($routeParams.mac).then(function(result) {
            $scope.cropList = result.data;
            $scope.cropList.forEach(function(item) {
              var startDateTime = GetTimeService.getDateTime(item.startdate);
              item.sdate = startDateTime.date;
              item.stime = startDateTime.time;

              var closeDateTime = GetTimeService.getDateTime(item.closedate);
              item.cdate = closeDateTime.date;
              item.ctime = closeDateTime.time;
            })
          })
          //$scope.cropList.push($scope.newCrop);
        }
      })
    } else {
      $scope.addCropSuccess = false;
      $scope.addCropMessage = isEmpty.message;
    }

  }
  /* end add new crop to device */

  /* delete crop */
  $scope.deleteCrop = function(index, cropId, status) {
    bootbox.confirm("Do you want to delete this crop ?", function(result){
      if (result)
      {
        var crop = {
          id: cropId
        }
        CropService.deleteCrop(crop).then(function(result) {
          if (result.data.success) {
            $scope.cropList.splice(index, 1);
          }
          bootbox.alert(result.data.message);
        })
      }
    })
  }
  /* end delete crop */

});
