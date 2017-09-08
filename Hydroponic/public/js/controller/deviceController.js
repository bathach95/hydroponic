controller.controller('DeviceCtrl', function ($http, $stateParams, $window, $scope, DeviceService, CropService, GetTimeService, flash) {

  /*---------------------- device ----------------------*/

  // display all devices of user and display on profile.html
  DeviceService.getAllDevicesByUserId().then(function (result) {

    if (result.data.success) {
      $scope.listDevice = result.data.data;
    } else {
      flash.error = result.data.message;
    }
  });

  // add a new device
  $scope.newDevice = {
    status: "no connection"
  }

  $scope.addDevice = function () {
    var isEmpty = DeviceService.checkDataAddDevice($scope.newDevice);
    if (!isEmpty.isErr) {
      DeviceService.addDevice($scope.newDevice).then(function (result) {
        if (result.data.success) {
          flash.success = result.data.message;
          bootbox.confirm(result.data.message, function () {
            $window.location.reload();
          })
        } else {
          flash.error = result.data.message;
        }

      });
    } else {
      $scope.addDeviceSuccess = false;
      $scope.addDeviceMessage = isEmpty.message;
    }
  }

  $scope.deleteDevice = function (index, mac) {
    var device = {
      mac: mac
    };

    bootbox.confirm('Do you want to delete this device ?', function (yes) {
      if (yes) {
        DeviceService.deleteDevice(device).then(function (result) {
          if (result.data.success) {
            $scope.listDevice.splice(index, 1);
            flash.success = result.data.message;
          } else {
            flash.error = result.data.message;
          }
        });
      }
    })
  }

});

controller.controller('DeviceDetailCtrl', function ($stateParams, $scope, DeviceService) {
  /* query all device data */
  DeviceService.getDeviceByMac($stateParams.mac).then(function (result) {
    $scope.device = result.data;
  });
})
