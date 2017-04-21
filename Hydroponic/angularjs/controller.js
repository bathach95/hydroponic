var myApp = angular.module('myApp',['ngCookies']);


myApp.factory('headerInterceptor',['$cookies',function($cookies){
  return {
    request: function(config){
      var token = $cookies.get('token');
      if(token){
        config.headers['token'] = token;
      }
      return config;
    }
  }
}]);

myApp.config(['$httpProvider', function($httpProvider){
  $httpProvider.interceptors.push('headerInterceptor');
}]);

myApp.controller('Register', function($http,$scope){
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

myApp.controller('Login', function($http,$scope,$rootScope,$cookies){
  $scope.user = {
        email: '',
        password: ''
  };
  $scope.login = function(){
    $http.post('/user/login',$scope.user).then(function(result){
      if(result.data.success==true){
        $rootScope.userLogin = result.data.data.name;
        $rootScope.loggedIn = true;
        var day = new Date();
        day.setDate(day.getDay()+30);
        $cookies.put('token',result.data.token,{expires:day});
        window.alert('Login success!');
      }
      else window.alert('Login failed!');
    });
  }
});

myApp.controller('TestLogin', function($http, $scope, $rootScope){
    $scope.test = function(){
      $http.get('/device/test').then(function(res){
        console.log(res);
      });
    }
});
