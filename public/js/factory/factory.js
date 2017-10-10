var factory = angular.module('myApp.factory',[]);


factory.factory('AuthInterceptor', function AuthInterceptor($cookieStore) {
  'use strict';
  return {
    request: addToken
  };

  function addToken(config) {
    var token = $cookieStore.get('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['token'] = token;
    }
    return config;
  }
});
