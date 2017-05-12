var factory = angular.module('myApp.factory',[]);


factory.factory('AuthInterceptor', function AuthInterceptor($cookies) {
  'use strict';
  return {
    request: addToken
  };

  function addToken(config) {
    var token = $cookies.get('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = 'Bearer ' + token;
    }
    return config;
  }
});
