var controller = angular.module('myApp.controllers', []);

controller.controller('LoginCtrl', function($scope, $rootScope, $localStorage, $window, UserService, AuthService) {
  $scope.user = {
    email: '',
    password: ''
  };
  $scope.login = function() {
    var isEmpty = AuthService.checkEmptyLogin($scope.user);
    if (!isEmpty.isErr) {
      UserService.login($scope.user).then(function(result) {
        if (result.data.success) {
          $rootScope.userLogin = result.data.data.name;
          // save data to localStorage
          $localStorage.token = result.data.token;
          $localStorage.name = result.data.data.name;
          $localStorage.email = result.data.data.email;
          $localStorage.phone = result.data.data.phone;
          //------------------
          window.alert('Login success!');
        } else {
          $scope.loginMessage = result.data.error;
        }
      });
    } else {
      $scope.loginMessage = isEmpty.message;
    }
  }

  $scope.logout = function() {
    UserService.logout();
    var url = "http://" + $window.location.host + "/";
    $window.location.href = url;
  }

  $rootScope.userLogin = $localStorage.name;
});

controller.controller('RegisterCtrl', function($http, $scope, UserService, AuthService) {
  $scope.user = {
    name: '',
    password: '',
    email: '',
    phone: ''
  };
  $scope.register = function() {
    var isEmpty = AuthService.checkEmptyReg($scope.user);
    if (!isEmpty.isErr) {
      UserService.register($scope.user).then(function(result) {
        $scope.success = result.data.success;
        $scope.regMessage = result.data.data.message;
      });
    } else {
      $scope.success = false;
      $scope.regMessage = isEmpty.message;
    }
  }
});

controller.controller('ProfileCtrl', function($http, $window, $localStorage, $scope, DeviceService, UserService, GetTimeService, AuthService) {

  /*---------------------- device ----------------------*/

  // display all devices of user and display on profile.html
  DeviceService.getAllDevicesByEmail($localStorage.email).then(function(result) {
    $scope.listDevice = result.data;
    $scope.listDevice.forEach(function(item) {
      var dateTime = GetTimeService.getDateTime(item.createdAt);
      item.date = dateTime.date;
      item.time = dateTime.time;
    });
  });

  // add a new device
  $scope.newDevice = {
    mac: '',
    type: '',
    name: '',
    manufacturer: '',
    status: "no connection",
    UserEmail: $localStorage.email
  }

  $scope.addDevice = function() {
    var isEmpty = DeviceService.checkDataAddDevice($scope.newDevice);
    if (!isEmpty.isErr) {
      DeviceService.addDevice($scope.newDevice).then(function(result) {
        $scope.addDeviceSuccess = result.data.success;
        $scope.addDeviceMessage = result.data.message;
        if (result.data.success) {
          var date = (new Date()).toString().split(' ');
          $scope.newDevice.date = date[1] + ' ' + date[2] + ' ' + date[3];
          $scope.newDevice.time = date[4];
          $scope.listDevice.push($scope.newDevice);
        }
      });
    } else {
      $scope.addDeviceSuccess = false;
      $scope.addDeviceMessage = isEmpty.message;
    }
  }

  $scope.deleteDevice = function(index, mac) {
    var device = {
      mac: mac
    };
    if (window.confirm("Do you want to delete this device ?")) {
      DeviceService.deleteDevice(device).then(function(result) {
        if (result.data.success) {
          $scope.listDevice.splice(index, 1);
        }
        window.alert(result.data.message);
      });
    }

  }
  /*-------------------- end device ---------------------*/

  /*----------------------- user ------------------------*/
  // display user infos
  $scope.user = {
    name: $localStorage.name,
    email: $localStorage.email,
    phone: $localStorage.phone
  }
  // update infos
  $scope.userUpdate = {
    email: $localStorage.email,
    name: '',
    phone: ''
  }

  $scope.update = function() {
    var isEmpty = AuthService.checkEmptyUpdate($scope.userUpdate);
    if (!isEmpty.isErr) {
      UserService.update($scope.userUpdate).then(function(result) {
        $localStorage.phone = $scope.userUpdate.phone;
        $localStorage.name = $scope.userUpdate.name;
        window.alert(result.data);
        $window.location.reload();
      });
    } else {
      $scope.updateMessage = isEmpty.message;
    }
  }

  //----- change pass -----------
  $scope.pass = {
    email: $localStorage.email,
    currPass: '',
    newPass: '',
    confNewPass: ''
  }

  $scope.changePass = function() {
    var error = AuthService.checkDataChangePass($scope.pass);
    if (!error.isErr) {
      UserService.changePass($scope.pass).then(function(result) {
        $scope.changePassSucc = result.data.success;
        $scope.changePassMessage = result.data.message;
      })
    } else {
      $scope.changePassMessage = error.message;
    }
  }
  /*--------------------- end user -------------------------*/
});

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
    treetype: '',
    startdate: '',
    closedate: '',
    reporttime: 0,
    status: true
  }
  $scope.addCrop = function() {
    console.log($scope.newCrop.closedate > new Date());
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
          $scope.cropList.push($scope.newCrop);
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
    if (window.confirm("Do you want to delete this crop ?")) {

      var crop = {
        id: cropId
      }
      CropService.deleteCrop(crop).then(function(result) {
        if (result.data.success) {
          $scope.cropList.splice(index, 1);
        }
        window.alert(result.data.message);
      })
    }
  }
  /* end delete crop */

});

controller.controller('CropCtrl', function($http, $routeParams, $scope, CropService, GetTimeService) {

  CropService.getCropById($routeParams.cropid).then(function(result) {
    $scope.crop = result.data;
    var startDate = GetTimeService.getDateTime($scope.crop.startdate);
    $scope.crop.startdate = startDate.date + " " + startDate.time;
    var closeDate = GetTimeService.getDateTime($scope.crop.closedate);
    $scope.crop.closedate = closeDate.date + " " + closeDate.time;
  })

});

controller.controller('ScheduleCtrl', function($http, $routeParams, $scope) {
  console.log($routeParams);
});

controller.controller('ThresholdCtrl', function($http, $routeParams, $rootScope, $scope, ThresholdService, GetTimeService) {
  ThresholdService.getNewestThresholdByCropId($routeParams.cropid).then(function(result) {
    $rootScope.threshold = result.data;
    $scope.threshold = result.data;
    var dateTime = GetTimeService.getDateTime(result.data.createdAt);
    $scope.threshold.date = dateTime.date;
    $scope.threshold.time = dateTime.time;
  });

  $scope.editThreshold = function(){
    
  }
});

controller.controller('DataCtrl', function($http, $routeParams, $rootScope, $scope, DataService, GetTimeService, DataStatusService) {
  $scope.deviceMac = $routeParams.devicemac;
  $scope.cropId = $routeParams.cropid;

  DataService.getNewestDataByCropId($scope.cropId).then(function(result) {

    $scope.data = result.data;
    var dateTime = GetTimeService.getDateTime(result.data.createdAt);
    $scope.data.date = dateTime.date;
    $scope.data.time = dateTime.time;

    // status of data
    $scope.threshold = $rootScope.threshold;
    var status = DataStatusService.getStatus($scope.data, $scope.threshold);
    $scope.badStatus = status.badStatus;
    $scope.status = status.status;

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
