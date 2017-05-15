'use strict';

var myApp = angular.module('myApp', ['ngCookies', 'ngRoute', 'ngStorage','myApp.controllers', 'myApp.factory', 'myApp.service']);

var isLoggedIn = function($location, $q, AuthService) {
    var deferred = $q.defer();
    if (AuthService.isLoggedIn()) {
        deferred.resolve();
    } else {
        deferred.reject();
        $location.url('/');
    }
    return deferred.promise;
};

myApp.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});

myApp.config(function($locationProvider, $routeProvider) {


    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/', {
            templateUrl: 'views/home/index.html',
        })
        .when('/system', {
            templateUrl: 'views/home/services.html',
        })
        .when('/article', {
            templateUrl: 'views/home/single.html',
        })
        .when('/forum', {
            templateUrl: 'views/home/gallery.html',
        })
        .when('/about', {
            templateUrl: 'views/home/about.html',
        })
        .when('/contact', {
            templateUrl: 'views/home/contact.html',
        })
        .when('/profile', {
            templateUrl: 'views/user/profile.html',
            controller: 'ProfileCtrl',
            resolve: {
                loggedIn: isLoggedIn
            }
        })
        .when('/device/:mac',{
            templateUrl: 'views/device/device-detail.html',
            controller: 'DeviceCtrl',
            resolve: {
                loggedIn: isLoggedIn
            }
        })
        .when('/device/:devicemac/crop/:cropid', {
            templateUrl: 'views/device/crop-detail.html',
            resolve: {
                loggedIn: isLoggedIn
            }
        })
        .when('/device/:devicemac/crop/:cropid/alldata', {
            templateUrl: 'views/device/all-logs.html',
            controller:'AllLogCtrl',
            resolve: {
                loggedIn: isLoggedIn
            }
        })
        .otherwise({
            redirectTo: '/'
        });
});
