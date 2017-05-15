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
                if (result.data.success == true) {
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
      if (!isEmpty.isErr){
        UserService.register($scope.user).then(function(result) {
            if (result.data.success) {
                $scope.regMessageSucc = result.data.data.message;
            } else {
              $scope.regMessageErr = result.data.data.message;
            }
        });
      } else {
        $scope.regMessageErr = isEmpty.message;
      }
    }
});

controller.controller('ProfileCtrl', function($http, $window, $localStorage, $scope, DeviceService, UserService, GetTimeService, AuthService) {
    // display all devices of user

    DeviceService.getAllDevices($localStorage.email).then(function(result) {
        $scope.listDevice = result.data;
        $scope.listDevice.forEach(function(item) {
            var dateTime = GetTimeService.getDateTime(item.createdAt);
            item.date = dateTime.date;
            item.time = dateTime.time;
        });
    });

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
      if (!isEmpty.isErr){
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

    $scope.changePass = function(){
      var error = AuthService.checkDataChangePass($scope.pass);
      if (!error.isErr){

      } else {
        $scope.changePassMessage = error.message;
      }
    }

});

controller.controller('DeviceCtrl', function($http, $routeParams, $scope, DeviceService, CropService, GetTimeService) {

    $scope.deviceMac = $routeParams.mac;

    DeviceService.getDeviceByMac($routeParams.mac).then(function(result) {
        $scope.device = result.data;
        var dateTime = GetTimeService.getDateTime($scope.device.createdAt);
        $scope.device.date = dateTime.date;
        $scope.device.time = dateTime.time;
    });

    // get all crops of device
    CropService.getAllCrops($routeParams.mac).then(function(result) {
        $scope.cropList = result.data;
        $scope.cropList.forEach(function(item) {
            var startDateTime = GetTimeService.getDateTime(item.startdate);
            item.sdate = startDateTime.date;
            item.stime = startDateTime.time;

            var closeDateTime = GetTimeService.getDateTime(item.closedate);
            item.cdate = closeDateTime.date;
            item.ctime = closeDateTime.time;
        });
    });

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
            console.log({
                itemTime: item.createdAt
            });
            var dateTime = GetTimeService.getDateTime(item.createdAt);
            item.date = dateTime.date;
            item.time = dateTime.time;
            //----status----
            var status = DataStatusService.getStatus(item, $scope.threshold);
            item.badStatus = status.badStatus;
            item.status = status.status;
            console.log(item);
            //--------------
        });
    });
});
