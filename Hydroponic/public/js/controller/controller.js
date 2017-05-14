
var controller = angular.module('myApp.controllers', []);

controller.controller('LoginCtrl', function($scope, $rootScope, $cookies, $window, UserService) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.login = function() {
            UserService.login($scope.user).then(function(result) {
                if (result.data.success == true) {
                    $rootScope.userLogin = result.data.data.name;
                    // save data to cookies
                    var day = new Date();
                    day.setDate(day.getDay() + 30);
                    $cookies.put('token', result.data.token, {
                        expires: day
                    });
                    $cookies.put('username', result.data.data.name, {
                        expires: day
                    });
                    $cookies.put('email', result.data.data.email, {
                        expires: day
                    });
                    $cookies.put('phone', result.data.data.phone, {
                        expires: day
                    });
                    //------------------
                    window.alert('Login success!');
                } else window.alert('Login failed!');
            });
        }

        $scope.logout = function() {
            UserService.logout();
            var url = "http://" + $window.location.host + "/";
            $window.location.href = url;
        }

      $rootScope.userLogin = $cookies.get('username');
    });

controller.controller('RegisterCtrl', function($http,$scope, UserService){
      $scope.user = {
            name: '',
            password: '',
            email: '',
            phone: ''
      };
      $scope.register = function(){
        UserService.register($scope.user).then(function(result){
          console.log(result.data);
          if(result.data.success){
            window.alert('Register success!');
          }
          else window.alert('Register failed!');
        });
      }
    });

controller.controller('ProfileCtrl', function($http, $window, $scope, $cookies, DeviceService, UserService){
    // display all devices of user

    DeviceService.getAllDevices($cookies.get('email')).then(function(result){
      $scope.listDevice = result.data;
    });

    // display user infos
    $scope.user = {
      name: $cookies.get('username'),
      email: $cookies.get('email'),
      phone: $cookies.get('phone')
    }
    // update infos
    $scope.userUpdate = {
      email: $cookies.get('email'),
      name: '',
      phone: ''
    }

    // TODO: check empty name and phone before update
    $scope.update = function(){
      UserService.update($scope.userUpdate).then(function(result){
        $cookies.put('phone', $scope.userUpdate.phone);
        $cookies.put('username', $scope.userUpdate.name);
        window.alert(result.data);
        $window.location.reload();
      });
    }

    //----- change pass -----------
    $scope.pass = {
      currPass: '',
      newPass: '',
      confNewPass: ''
    }

});

controller.controller('DeviceCtrl', function($http, $routeParams, $scope, DeviceService, CropService){

  $scope.deviceMac = $routeParams.mac;

  DeviceService.getDeviceByMac($routeParams.mac).then(function(result){
    $scope.device = result.data;
  });

  // get all crops of device
  CropService.getAllCrops($routeParams.mac).then(function(result){
    $scope.cropList = result.data;
  });

});

controller.controller('CropCtrl', function($http, $routeParams, $scope, CropService, GetTimeService){

  CropService.getCropById($routeParams.cropid).then(function(result){
    $scope.crop = result.data;
    var startDate = GetTimeService.getDateTime($scope.crop.startdate);
    $scope.crop.startdate = startDate.date + " " + startDate.time;
    var closeDate = GetTimeService.getDateTime($scope.crop.closedate);
    $scope.crop.closedate = closeDate.date + " " + closeDate.time;
  })
});

controller.controller('ScheduleCtrl', function($http, $routeParams, $scope){
  console.log($routeParams);
});

controller.controller('ThresholdCtrl', function($http, $routeParams,$rootScope, $scope, ThresholdService, GetTimeService){
  ThresholdService.getNewestThresholdByCropId($routeParams.cropid).then(function(result){
    $rootScope.threshold = result.data;
    $scope.threshold = result.data;
    var dateTime = GetTimeService.getDateTime(result.data.createdAt);
    $scope.threshold.date = dateTime.date;
    $scope.threshold.time = dateTime.time;
  });
});

controller.controller('DataCtrl', function($http, $routeParams, $rootScope, $scope, DataService, GetTimeService){
  $scope.deviceMac = $routeParams.devicemac;
  $scope.cropId = $routeParams.cropid;

  DataService.getNewestDataByCropId($scope.cropId).then(function(result){

    $scope.data = result.data;
    var dateTime = GetTimeService.getDateTime(result.data.createdAt);
    $scope.data.date = dateTime.date;
    $scope.data.time = dateTime.time;

    // status of data
    $scope.threshold = $rootScope.threshold;
    $scope.badStatus ={
      temp: $scope.data.temperature < $scope.threshold.temperatureLower || $scope.data.temperature > $scope.threshold.temperatureUpper,
      humidity: $scope.data.humidity < $scope.threshold.humidityLower || $scope.data.humidity > $scope.threshold.humidityUpper,
      ppm: $scope.data.ppm < $scope.threshold.ppmLower || $scope.data.ppm > $scope.threshold.ppmUpper,
      ph: $scope.data.ph < $scope.threshold.phLower || $scope.data.ph > $scope.threshold.phUpper
    }

    $scope.status = $scope.badStatus.temp || $scope.badStatus.humidity || $scope.badStatus.ppm || $scope.badStatus.ph;

  })
});


controller.controller('AllLogCtrl', function($http, $routeParams, $rootScope, $scope, DataService, GetTimeService){

  DataService.getAllData($routeParams.cropid).then(function(result){
    $scope.data = result.data;
    $scope.data.forEach(function(item){
      var dateTime = GetTimeService.getDateTime(item.createdAt);
      item.date = dateTime.date;
      item.time = dateTime.time;
    });
  });
});
