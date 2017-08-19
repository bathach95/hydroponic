var controller = angular.module('myApp.controllers', ['ui.directives','ui.filters','ngCookies']);

controller.controller('LoginCtrl', function($location, $cookies, $scope, $rootScope, $localStorage, $window, UserService, AuthService, flash) {

  $scope.user = {};

  $scope.login = function() {
    
    var isEmpty = AuthService.checkEmptyLogin($scope.user);
    if (!isEmpty.isErr) {
      UserService.login($scope.user).then(function(result) {
        if (result.data.success) {
          $rootScope.userLogin = result.data.data.name;
          // save data to localStorage
          $localStorage.token = result.data.token;
          $localStorage.userid = result.data.data.userid;
          $localStorage.name = result.data.data.name;
          $localStorage.email = result.data.data.email;
          $localStorage.phone = result.data.data.phone;
          //------------------
          var day = new Date();
          day.setDate(day.getDay()+30);

          var options  = {
              domain: "localhost",
              httpOnly: true,
              expires: day
          };

          $cookies.put('token',result.data.token,options);
          $cookies.put('name',result.data.data.name,options);
          flash.success = 'Login success!';
          $location.url('/');
        } else {
          flash.error = result.data.data.message + result.data.error;
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
  // // display username after login
  if ($cookies.get('token')){
    $rootScope.userLogin = $cookies.get('name');
  }

});

controller.controller('ResetPassCtrl', function($scope, UserService){

  $scope.user = {};

  $scope.resetPassword = function(){
    if($scope.user.email){
      UserService.resetPass($scope.user).then(function(result){
        $scope.success = result.data.success;
        $scope.message = result.data.message;
      })
    }
  }
  
});

controller.controller('RegisterCtrl', function($location, $http, $scope, UserService, AuthService, flash) {
  $scope.user = {};

  $scope.register = function() {
    var isEmpty = AuthService.checkEmptyReg($scope.user);
    if (!isEmpty.isErr) {
      UserService.register($scope.user).then(function(result) {

        $scope.message = result.data.message;
        $scope.success = result.data.success;        

        if(result.data.success){
          flash.success = result.data.message;
        } else {
          flash.error = result.data.message;
        }
      });
    } else {
      $scope.success = false;
      $scope.message = isEmpty.message;
    }
  }
});

controller.controller('ActiveUserCtrl', function($routeParams, $scope, UserService, flash){
  UserService.activeAccount($routeParams).then(function(result){

    $scope.success = result.data.success;
    $scope.message = result.data.message;
    
    if(result.data.success){
      flash.success = result.data.message;
    } else {
      flash.error = result.data.message;
    }
  })
});

controller.controller('ProfileCtrl', function($http, $window, $localStorage, $scope, DeviceService, UserService, GetTimeService, AuthService) {

  /*---------------------- device ----------------------*/

  // display all devices of user and display on profile.html
  DeviceService.getAllDevicesByUserId($localStorage.userid).then(function(result) {
    $scope.listDevice = result.data;
    $scope.listDevice.forEach(function(item) {
      var dateTime = GetTimeService.getDateTime(item.createdAt);
      item.date = dateTime.date;
      item.time = dateTime.time;
    });
  });

  // add a new device
  $scope.newDevice = {
    status: "no connection",
    UserId: $localStorage.userid
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
        bootbox.alert(result.data.message);
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
        bootbox.alert(result.data);
        $window.location.reload();
      });
    } else {
      $scope.updateMessage = isEmpty.message;
    }
  }

  //----- change pass -----------
  $scope.pass = {
    email: $localStorage.email,
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
