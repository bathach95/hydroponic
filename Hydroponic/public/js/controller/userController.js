var controller = angular.module('myApp.controllers', ['ui.directives', 'ui.filters', 'ngCookies']);

controller.controller('LoginCtrl', function ($http, $state, $sessionStorage, $cookies, $scope, $rootScope, $state, UserService, AuthService, flash) {

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
          $sessionStorage.user = 'heheeheh';
          flash.success = result.data.message;
          $state.go('home');
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

  // display username after login
  if (AuthService.isLoggedIn) {
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

controller.controller('RegisterCtrl', function ($http, $state, $scope, UserService, AuthService, flash) {
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

controller.controller('ProfileCtrl', function ($window, $state, $http, $cookies, $scope, DeviceService, UserService, GetTimeService, AuthService, flash) {

  /*----------------------- user ------------------------*/
  $scope.currentUser = {};
  $scope.userUpdate = {};

  UserService.getUserDetail().then(function (result) {
    if (result.data.success) {
      $scope.currentUser = result.data.data;
      $scope.userUpdate = result.data.data;
    } else {
      flash.error = result.data.message;
    }
  })
  // update infos

  $scope.update = function () {
    UserService.update($scope.userUpdate).then(function (result) {
      if (result.data.success) {
        flash.success = result.data.message;
        bootbox.confirm(result.data.message, function () {
          $window.location.reload();
        })
      } else {
        flash.error = result.data.message;
      }
    });
  }

  //----- change pass -----------
  $scope.pass = {};

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
