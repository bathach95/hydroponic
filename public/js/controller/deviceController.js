controller.controller('DeviceCtrl', function($http, $routeParams, $window, $scope, $localStorage, DeviceService, CropService, GetTimeService) {

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
    $scope.currentPage = 1;
    $scope.numberPagination = Math.ceil($scope.cropList.length / 5);
    $scope.listCropPage = [];
    for (i = 1; i <= 5; i++)
    {
      if (i <= $scope.cropList.length)
      $scope.listCropPage.push($scope.cropList[i - 1]);
    }
  });
  /* end get all crop of device */

  $scope.nextPagination = function(numberPage){
    $scope.currentPage = numberPage;
    $scope.listCropPage = [];
    for (i = 1; i <= 5; i++)
    {
      if (((numberPage - 1)*5 + i) <= $scope.cropList.length)
        $scope.listCropPage.push($scope.cropList[((numberPage - 1)*5 + i) - 1]);
    }
  }
  $scope.previousPagination = function(numberPage){
    $scope.currentPage = numberPage;
    $scope.listCropPage = [];
    for (i = 1; i <= 5; i++)
    {
      $scope.listCropPage.push($scope.cropList[((numberPage - 1)*5 + i) - 1]);
    }
  }

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
    //if (!isEmpty.isErr) {
    console.log("WWWWWWW");
      CropService.addCrop($scope.newCrop).then(function(result) {
        console.log("SSSSAAA");
        $scope.addCropMessage = result.data.message;
        $scope.addCropSuccess = result.data.success;
        console.log("SSSS");
        if (result.data.success) {
          console.log("AAAAAAA");
          // var sdate = $scope.newCrop.startdate.toString().split(' ');
          // var cdate = $scope.newCrop.closedate.toString().split(' ');
          //
          // $scope.newCrop.sdate = sdate[1] + ' ' + sdate[2] + ' ' + sdate[3];
          // $scope.newCrop.stime = sdate[4];
          // $scope.newCrop.cdate = cdate[1] + ' ' + cdate[2] + ' ' + cdate[3];
          // $scope.newCrop.ctime = cdate[4];
          // CropService.getAllCrops($routeParams.mac).then(function(result) {
          //   $scope.cropList = result.data;
          //   $scope.cropList.forEach(function(item) {
          //     var startDateTime = GetTimeService.getDateTime(item.startdate);
          //     item.sdate = startDateTime.date;
          //     item.stime = startDateTime.time;
          //
          //     var closeDateTime = GetTimeService.getDateTime(item.closedate);
          //     item.cdate = closeDateTime.date;
          //     item.ctime = closeDateTime.time;
          //   })
          // })
          //$scope.cropList.push($scope.newCrop);
          bootbox.alert(result.data.message, function(){
            setTimeout(reload, 1000);
          });
          $('#addCropModal').modal('toggle');
          $scope.newCrop.name = '';
          $scope.newCrop.type = '';
          $scope.newCrop.treetype = '';
          $scope.newCrop.startdate = '';
          $scope.newCrop.closedate = '';
          $scope.newCrop.reporttime = '';
        }
        else
        {
          bootbox.alert(result.data.message);
        }

      })
    //} else {
    //  $scope.addCropSuccess = false;
    //  $scope.addCropMessage = isEmpty.message;
    //}

  }
  /* end add new crop to device */

  function reload(){
    $window.location.reload();
  }

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
            //$scope.cropList.splice(index, 1);
          }
          bootbox.alert(result.data.message, function(){
            setTimeout(reload, 1000);
          });
        })
      }
    })
  }
  /* end delete crop */

});
