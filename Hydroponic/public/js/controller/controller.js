
var controller = angular.module('myApp.controllers', []);

controller.controller('Login', function($http, $scope, $rootScope, $cookies, $window) {
        $scope.user = {
            email: '',
            password: ''
        };
        $scope.login = function() {
            $http.post('/user/login', $scope.user).then(function(result) {
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
                    //------------------
                    window.alert('Login success!');
                } else window.alert('Login failed!');
            });
        }

        $scope.logout = function() {
            $cookies.remove('token');
            $cookies.remove('username');
            var url = "http://" + $window.location.host + "/";
            $window.location.href = url;
        }


    });

controller.controller('Register', function($http,$scope){
      $scope.user = {
            name: '',
            password: '',
            email: '',
            phone: ''
      };
      $scope.register = function(){
        $http.post('/user/register',$scope.user).then(function(result){
          console.log(result.data);
          if(result.data.success){
            window.alert('Register success!');
          }
          else window.alert('Register failed!');
        });
      }
    });
