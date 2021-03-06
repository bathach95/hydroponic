controller.controller('DeviceCtrl', function ($http, $state, $stateParams, $window, $scope, $timeout, DeviceService, CropService, GetTimeService, ActuatorService, flash) {

  /*---------------------- device ----------------------*/
  // display all devices of user and display on profile.html
  DeviceService.getAllDevicesByUserId().then(function (result) {

    console.log(result.data.data);
    if (result.data.success) {
      $scope.listDevice = result.data.data;
      $scope.dataTableOpt = {
      "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50,'All']],
      };

    } else {
      flash.error = result.data.message;
    }
  });
  $scope.status = function(index, deviceMac, newStatus) {
    var device = {
      mac: deviceMac,
      status: newStatus
    }

      DeviceService.updateStatus(device).then(function (result) {
        if (result.data.success) {
          $scope.listDevice[index].status = newStatus;
          flash.success = result.data.message;
        }
        else
        {
          flash.error = result.data.message;
        }
      })
  }

  // add a new device
  $scope.newDevice = {
    status: "no connection"
  }

  $scope.addDevice = function () {
    //$('#addDeviceModal').modal('hide');
    $('#addNewDeviceButton').button('loading');
    DeviceService.addDevice($scope.newDevice).then(function (result) {
      if (result.data.success) {
        flash.success = result.data.message;
        $state.go('profile');
        bootbox.alert(result.data.message);
      } else {
        flash.error = result.data.message;
      }
      $timeout(function () {
          $('#addNewDeviceButton').button('reset');
        }, 1000);
    });

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

controller.controller('DeviceDetailCtrl', function ($stateParams, $scope, DeviceService, ActuatorService) {
  /* query all device data */
  $scope.mac = $stateParams.mac;

  $scope.dataTableOpt = {
    "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50,'All']],
  };

  DeviceService.getDeviceByMac($stateParams.mac).then(function (result) {
    $scope.device = result.data;
  });

})

