var controller = angular.module('myApp.controllers', ['ui.directives', 'ui.filters', 'ngCookies']);

controller.controller('DomReadyCtrl', function($timeout, $scope){
  $(".se-pre-con").fadeOut("slow");
});
controller.controller('LoginCtrl', function ($http, $state, $sessionStorage, $cookies, $scope, $rootScope, $state, $timeout, UserService, AuthService, flash) {

  $scope.user = {};

  $scope.login = function () {
    $('#loginBtn').button('loading');
    var isEmpty = AuthService.checkEmptyLogin($scope.user);
    if (!isEmpty.isErr) {
      new Promise(function(resolve, reject){
        UserService.login($scope.user).then(function (result) {

          resolve(result);

      });
    }).then(function(result){
      if (result.data.success) {
        $rootScope.userLogin = result.data.data.name;
        $rootScope.emailLogin = result.data.data.email;
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
        flash.success = result.data.message;
        $state.go('home');
      }
      else
      {
        flash.error = result.data.message;
        $timeout(function () {
          $('#loginBtn').button('reset');
        }, 1000);
      }
    })
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

controller.controller('RegisterCtrl', function ($http, $state, $scope, $q, $timeout, UserService, AuthService, flash) {
  $scope.user = {};
  $scope.register = function () {
    $('#registerBtn').button('loading');
    var isEmpty = AuthService.checkEmptyReg($scope.user);
    if (!isEmpty.isErr) {
        UserService.register($scope.user).then(function (result) {
        $scope.message = result.data.message;
        $scope.success = result.data.success;

        if (result.data.success) {
          flash.success = result.data.message;
          $state.go('registered');
        }
        else
        {
          flash.error = result.data.message;
          $timeout(function() {
            $('#registerBtn').button('reset');
          }, 1000);
        }
      });
    } else {
      $scope.success = false;
      $scope.message = isEmpty.message;
    }
  }

  $scope.confirmPasswordValidation = function (modelValue, viewValue) {
    var value = modelValue || viewValue;
    var passwordValue = $scope.user.password;
    var deferred = $q.defer();
    if (value === '')
    {
      deferred.resolve();
    }
    else {
      $timeout(function() {
      if (value === passwordValue)
      {
        deferred.resolve();
      }
      else {
        deferred.reject();
      }
      }, 2000);
    }
    return deferred.promise;
  }

  // The validation function
  $scope.myValidation = function (modelValue, viewValue) {

      // Get the value
      var value = modelValue || viewValue;

      var deferred = $q.defer();

      if (value === '')
      {
        deferred.resolve();
      }
      else {
        $timeout(function() {
          new Promise(function(resolve, reject) {
            var user ={
              email: value
            }
            UserService.checkEmail(user).then(function (result) {
              resolve(result);
            });
          }).then(function(result){
            // Check if is already taken
            if(!result.data.success) {
            //    // Username exists, this means validation fails
                return deferred.reject();
            } else {
                // Username does not exist, therefore this validation passes
                return deferred.resolve();
           };
         })
     }, 2000);
    }
    return deferred.promise;
  }


});
controller.controller('RegisteredCtrl', function ($http, $state, $scope, $q, $timeout, flash) {
  $timeout(function() {
    $state.go('home');
  }, 8000);
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

controller.controller('ProfileCtrl', function ($http, $window, $state, $http, $cookies, $scope, DeviceService, UserService, GetTimeService, AuthService, flash) {

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
        $state.go('profile');
        // bootbox.confirm(result.data.message, function () {
        //
        // })
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
