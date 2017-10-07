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
          bootbox.alert('Login success!');
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
