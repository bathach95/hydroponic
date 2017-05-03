var myApp = angular.module('myApp',['ngCookies']);


myApp.factory('headerInterceptor',['$cookies',function($cookies, $rootScope){
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

myApp.run(function($rootScope, $cookies) {
    if ($cookies.get('token')){
      $rootScope.userLogin = $cookies.get('username');
    }
});


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

myApp.controller('Login', function($http,$scope,$rootScope,$cookies, $window){
  $scope.user = {
        email: '',
        password: ''
  };
  $scope.login = function(){
    $http.post('/user/login',$scope.user).then(function(result){
      if(result.data.success==true){
        $rootScope.userLogin = result.data.data.name;
        // save data to cookies
        var day = new Date();
        day.setDate(day.getDay()+30);
        $cookies.put('token',result.data.token,{expires:day});
        $cookies.put('username',result.data.data.name,{expires:day});
        //------------------
        window.alert('Login success!');
      }
      else window.alert('Login failed!');
    });
  }

  $scope.logout = function(){
    $cookies.remove('token');
    $cookies.remove('username');
    var url = "http://" + $window.location.host + "/";
    $window.location.href = url;
  }


});

myApp.controller('TestLogin', function($http, $scope, $rootScope){
    $scope.test = function(){
      $http.get('/device/test').then(function(res){
        console.log(res);
      });
    }
});
