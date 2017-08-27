var controller = angular.module('myApp.controllers', ['ui.directives', 'ui.filters', 'ngCookies']);

controller.controller('LoginCtrl', function ($http, $location, $cookies, $scope, $rootScope, $state, UserService, AuthService, flash) {

  $scope.user = {};

  $scope.login = function () {

    var isEmpty = AuthService.checkEmptyLogin($scope.user);
    if (!isEmpty.isErr) {
      UserService.login($scope.user).then(function (result) {
        if (result.data.success) {
          $rootScope.userLogin = result.data.data.name;

          //------------------
          var day = new Date();
          day.setDate(day.getDay() + 30);

          var options = {
            domain: "localhost",
            httpOnly: true,
            expires: day
          };

          $cookies.put('token', result.data.data.token, options);
          $cookies.put('name', result.data.data.name, options);
          $cookies.put('userid', result.data.data.userid, options);
          $cookies.put('email', result.data.data.email, options);
          $cookies.put('phone', result.data.data.phone, options);
          $cookies.put('role', result.data.data.role, options);
          flash.success = result.data.message;
          $location.url('/');
        } else {
          flash.error = result.data.message;
        }
      });
    } else {
      $scope.loginMessage = isEmpty.message;
    }
  }

  $scope.logout = function () {
    UserService.logout();
    $rootScope.userLogin = null;
    flash.success = 'Logout success!'
    $state.go('home');
  }

  $scope.dashboard_get = function () {
    $http.get('/admin').then(function (result) {

      if (result.data.success) {
        $state.go('admin')

      }

      console.log('admin get to /dashboard');
    }).catch(function (err) {
      console.log(err)
    })
  }

  $scope.dashboard_post = function () {
    $http.post('/dashboard').then(function (result) {
      console.log(result);
      console.log('post to /dashboard');
    }).catch(function (err) {
      console.log(err)
    })
  }
  // // display username after login
  if ($cookies.get('token')) {
    $rootScope.userLogin = $cookies.get('name');
  }

});

controller.controller('ResetPassCtrl', function ($scope, UserService) {

  $scope.user = {};

  $scope.resetPassword = function () {
    if ($scope.user.email) {
      UserService.resetPass($scope.user).then(function (result) {
        $scope.success = result.data.success;
        $scope.message = result.data.message;
      })
    }
  }

});

controller.controller('RegisterCtrl', function ($location, $http, $scope, UserService, AuthService, flash) {
  $scope.user = {};

  $scope.register = function () {
    var isEmpty = AuthService.checkEmptyReg($scope.user);
    if (!isEmpty.isErr) {
      UserService.register($scope.user).then(function (result) {

        $scope.message = result.data.message;
        $scope.success = result.data.success;

        if (result.data.success) {
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

controller.controller('ActiveUserCtrl', function ($stateParams, $scope, UserService, flash) {
  UserService.activeAccount($stateParams).then(function (result) {

    $scope.success = result.data.success;
    $scope.message = result.data.message;

    if (result.data.success) {
      flash.success = result.data.message;
    } else {
      flash.error = result.data.message;
    }
  })
});

controller.controller('ProfileCtrl', function ($window, $http, $cookies, $scope, DeviceService, UserService, GetTimeService, AuthService, flash) {

  /*---------------------- device ----------------------*/

  // display all devices of user and display on profile.html
  DeviceService.getAllDevicesByUserId($cookies.get('userid')).then(function (result) {

    if (result.data.success) {
      $scope.listDevice = result.data.data;
    } else {
      flash.error = result.data.message;
    }
  });

  // add a new device
  $scope.newDevice = {
    status: "no connection",
    UserId: $cookies.get('userid')
  }

  $scope.addDevice = function () {
    var isEmpty = DeviceService.checkDataAddDevice($scope.newDevice);
    if (!isEmpty.isErr) {
      DeviceService.addDevice($scope.newDevice).then(function (result) {
        if (result.data.success) {
          flash.success = result.data.message;
          bootbox.alert(result.data.message, function () {
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
    if (window.confirm("Do you want to delete this device ?")) {
      DeviceService.deleteDevice(device).then(function (result) {
        if (result.data.success) {
          $scope.listDevice.splice(index, 1);
          flash.success = result.data.message;
        } else {
          flash.error = result.data.message;
        }
      });
    }

  }
  /*-------------------- end device ---------------------*/

  /*----------------------- user ------------------------*/
  // update infos
  $scope.userUpdate = {
    email: $cookies.get('email'),
    name: $cookies.get('name'),
    phone: $cookies.get('phone')
  }

  $scope.update = function () {
    var isEmpty = AuthService.checkEmptyUpdate($scope.userUpdate);
    if (!isEmpty.isErr) {
      UserService.update($scope.userUpdate).then(function (result) {
        if (result.data.success) {
          $cookies.put('phone', $scope.userUpdate.phone);
          $cookies.put('name', $scope.userUpdate.name);
          flash.success = result.data.message;

        } else {
          flash.error = result.data.message;
        }
      });
    } else {
      $scope.updateMessage = isEmpty.message;
    }
  }

  //----- change pass -----------
  $scope.pass = {
    email: $cookies.get('email'),
  }

  $scope.changePass = function () {
    var error = AuthService.checkDataChangePass($scope.pass);
    if (!error.isErr) {
      UserService.changePass($scope.pass).then(function (result) {
        if (result.data.success) {
          flash.success = result.data.message;
        } else {
          flash.error = result.data.message;
        }
      })
    } else {
      $scope.changePassMessage = error.message;
    }
  }
  /*--------------------- end user -------------------------*/
});
