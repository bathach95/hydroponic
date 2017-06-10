var controller = angular.module('myApp.controllers', ['ui.directives','ui.filters']);

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
    confirm_password:'',
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
  // update infos
  $scope.userUpdate = {
    email: $localStorage.email,
    name: $localStorage.name,
    phone: $localStorage.phone
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

controller.controller('ScheduleCtrl', function($http, $routeParams, $scope, ScheduleService) {
  ScheduleService.getScheduleByCropId($routeParams.cropid).then(function(result){
    //$scope.selectedActuator = 1;
    //var obj = result.data.filter(function(item){
    //  return item.actuatorid === $scope.selectedActuator;
    //})[0];
    //$scope.turnonevery = obj.turnonevery;
    $scope.scheduleListWatering = result.data.watering;
    $scope.scheduleTypeSelected = 'watering';
    console.log($scope.selectedActuator);
    console.log(result.data);
  })
  $scope.typeSelected = function(type) {
    $scope.scheduleTypeSelected = type;
  }

});
controller.controller('ScheduleSettingCtrl', function($http, $routeParams, $scope, $route, $timeout, ScheduleService) {
  ScheduleService.getScheduleByCropId($routeParams.cropid).then(function(result){
    // $scope.selectedActuator = null;
    //var obj = result.data.filter(function(item){
    //  return item.actuatorid === $scope.selectedActuator;
    //})[0];
    //$scope.turnonevery = obj.turnonevery;
    $scope.scheduleSettingTypeSelected = 'watering';
    $scope.scheduleSettingListWatering = result.data.watering;
    $scope.scheduleSettingListFan = result.data.fan;
    $scope.scheduleSettingListLighting = result.data.lighting;
    $scope.scheduleSettingListOxygen = result.data.oxygen;
    console.log($scope.selectedActuator);
    console.log(result.data);
  })
  $scope.typeSettingSelected = function(type) {
    $scope.scheduleSettingTypeSelected = type;
    console.log(type);
  }

  $scope.insRow = function(scheduleType) {
    var date = new Date();
    this.timeto.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    this.timefrom.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    if (this.timefrom <= this.timeto)
    {
      var obj = {
          type: $scope.scheduleSettingTypeSelected,
          actuatorid: $scope.selectedActuatorId,
          turnonevery: 1,
          timefrom: this.timefrom.toLocaleTimeString("vi-VN",{hour12:false}),
          timeto: this.timeto.toLocaleTimeString("vi-VN",{hour12:false}),
          delaytime: this.delaytime,
          lasttime: this.lasttime
      };
      switch ($scope.scheduleSettingTypeSelected) {
        case 'watering':
          var index = checkNewScheduleItem($scope.scheduleSettingListWatering, obj)
          if (index != null)
            $scope.scheduleSettingListWatering.splice(index, 0, obj);
          else
            window.alert("Overlap Time");
          break;
        case 'fan':
          $scope.scheduleSettingListFan.push(obj);
          break;
        case 'lighting':
          $scope.scheduleSettingListLighting.push(obj);
          break;
        case 'oxygen':
          $scope.scheduleSettingListOxygen.push(obj);
          break;
        default:
      };
      this.timeto = null;
      this.timefrom = null;
      this.delaytime = null;
      this.lasttime = null;
    }
    else {
      window.alert("Please choose start time before end time!");
    }
  }

  function checkNewScheduleItem(list, item){
    console.log("---i----");
    for (i = 0; i < list.length; i++)
    {
      if (item.actuatorid == list[i].actuatorid)
      {
        if (item.timefrom >= list[i].timeto)
          continue;
        else
        {
          if (item.timefrom <= list[i].timefrom)
          {
            if (item.timeto > list[i].timefrom)
              return null;
            else
              return i;
          }
          else
          {
            return null
          }
        }
      }
    }
    return list.length;
    console.log("---i----");
  }
  $scope.deleteRow = function(scheduleSettingTypeSelected, row){
    console.log("" + i);
    switch (scheduleSettingTypeSelected) {
      case 'watering':
        var i = $scope.scheduleSettingListWatering.indexOf(row.schedule);
        $scope.scheduleSettingListWatering.splice(i, 1);
        break;
      case 'fan':
        var i = $scope.scheduleSettingListFan.indexOf(row.schedule);
        $scope.scheduleSettingListFan.splice(i, 1);
        break;
      case 'lighting':
        var i = $scope.scheduleSettingListLighting.indexOf(row.schedule);
        $scope.scheduleSettingListLighting.splice(i, 1);
        break;
      case 'oxygen':
        var i = $scope.scheduleSettingListOxygen.indexOf(row.schedule);
        $scope.scheduleSettingListOxygen.splice(i, 1);
        break;
      default:
    };
  }

  $scope.cancelScheduleSetting = function() {
      // console.log("Schedule Setting canceled!");
       $timeout(function(){
      //   // 1 second delay, might not need this long, but it works.
         $route.reload();
       }, 1000);
    }

    $scope.saveAndApply = function() {
      console.log("Saved and applied!");
    };
});

controller.controller('ThresholdCtrl', function($http, $window, $routeParams, $rootScope, $scope, ThresholdService, GetTimeService) {
  ThresholdService.getNewestThresholdByCropId($routeParams.cropid).then(function(result) {
    if (result.data) {

      $rootScope.threshold = result.data;
      $scope.threshold = result.data;
      var dateTime = GetTimeService.getDateTime(result.data.createdAt);
      $scope.threshold.date = dateTime.date;
      $scope.threshold.time = dateTime.time;

      $scope.newThreshold = {
        temperatureLower: $scope.threshold.temperatureLower,
        temperatureUpper: $scope.threshold.temperatureUpper,
        humidityLower: $scope.threshold.humidityLower,
        humidityUpper: $scope.threshold.humidityUpper,
        ppmLower: $scope.threshold.ppmLower,
        ppmUpper: $scope.threshold.ppmUpper,
        phLower: $scope.threshold.phLower,
        phUpper: $scope.threshold.phUpper
      }
    }
  });

function reload(){
  $window.location.reload();
}
  // add new threshold
  $scope.addThreshold = function() {

    var isEmpty = ThresholdService.checkDataEditThreshold($scope.newThreshold);
    if (!isEmpty.isErr) {
      $scope.newThreshold.CropId = $routeParams.cropid;
      ThresholdService.addThreshold($scope.newThreshold).then(function(result) {
        $scope.editThresholdSuccess = result.data.success;
        $scope.editThresholdMessage = result.data.message;

        // if success, update view
        if (result.data.success){
          setTimeout(reload, 2000);
        }

      });
    } else {
      $scope.editThresholdSuccess = false;
      $scope.editThresholdMessage = isEmpty.message;
    }
  }
});

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
