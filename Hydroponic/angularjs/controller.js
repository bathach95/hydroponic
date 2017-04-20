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
        username: '',
        password: '',
        email: ''
  };
  $scope.register = function(){
    console.log($scope.user);
    $http.post('/users/register',$scope.user).then(function(result){
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
        username: '',
        password: ''
  };
  $scope.login = function(){
    $http.post('/users/login',$scope.user).then(function(result){
      if(result.data.success==true){
        $rootScope.userLogin = result.data.data.username;
        var day = new Date();
        day.setDate(day.getDay()+30);
        $cookies.put('token',result.data.token,{expires:day});
        window.alert('Login success!');
      }
      else window.alert('Login failed!');
    });
  }
});
