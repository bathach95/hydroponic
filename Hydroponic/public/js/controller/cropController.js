controller.controller('CropCtrl', function ($http, $stateParams, $scope, $window, CropService, GetTimeService, flash) {
  $scope.deviceMac = $stateParams.mac;
  /* get all crops of device */
  CropService.getAllCrops($stateParams.mac).then(function (result) {

    if (result.data.success) {
      $scope.cropList = result.data.data;

      $scope.cropList.forEach(function (item) {
        // TODO: 
        // check status of crop
        // if close date is after today, crop is running, otherwise crop has finished

      });
    } else {
      flash.error = result.data.message;
    }
  });
  /* end get all crop of device */

  /* add new crop to device */
  $scope.newCrop = {
    DeviceMac: $stateParams.mac,
    name: '',
    type: '',
    treetype: '',
    startdate: '',
    closedate: '',
    reporttime: 0,
    status: true
  }
  $scope.addCrop = function () {
    CropService.addCrop($scope.newCrop).then(function (result) {
      $scope.addCropMessage = result.data.message;
      $scope.addCropSuccess = result.data.success;
      if (result.data.success) {
        bootbox.alert(result.data.message, function () {
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
      else {
        bootbox.alert(result.data.message);
      }

    })
  }
  /* end add new crop to device */

  function reload() {
    $window.location.reload();
  }

  /* delete crop */
  $scope.deleteCrop = function (index, cropId, status) {
    bootbox.confirm("Do you want to delete this crop ?", function (result) {
      if (result) {
        var crop = {
          id: cropId
        }
        CropService.deleteCrop(crop).then(function (result) {
          if (result.data.success) {
            $scope.cropList.splice(index, 1);
            flash.success = result.data.message;
          } else {
            flash.error = result.data.message;
          }

        })
      }
    })
  }

  /* update share status */
  $scope.share = function (cropId, newShare, index) {
    var crop = {
      id : cropId,
      share: newShare
    }
    CropService.updateShareStatus(crop).then(function(result){
      if (result.data.success){
        $scope.cropList[index].share = newShare;
      } else {
        flash.error = result.data.message;
      }
    })
  }


});

controller.controller('CropDetailCtrl', function ($scope, $window, $stateParams, CropService, flash) {

  CropService.getCropById($stateParams.cropid).then(function (result) {

    if (result.data.success) {
      $scope.crop = result.data.data;
    } else {
      flash.error = result.data.message;
    }

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

  function reload() {
    $window.location.reload();
  }


  $scope.editCrop = function () {
    CropService.editCrop($scope.cropEdit).then(function (result) {
      $scope.editSuccess = result.data.success;
      $scope.editMessage = result.data.message;
      if (result.data.success) {
        setTimeout(reload, 1000);
      }
    }).catch(function (err) {
      console.log(err);
    })
  }
})
