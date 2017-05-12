'use strict';

var myApp = angular.module('myApp', ['ngCookies', 'ngRoute', 'myApp.controllers', 'myApp.factory']);

myApp.config(function($locationProvider, $routeProvider) {
    $locationProvider.hashPrefix('');
    $routeProvider
        .when('/', {
            templateUrl: 'views/index.html',
        })
        .when('/system', {
            templateUrl: 'views/services.html',
        })
        .when('/article', {
            templateUrl: 'views/single.html',
        })
        .when('/forum', {
            templateUrl: 'views/gallery.html',
        })
        .when('/about', {
            templateUrl: 'views/about.html',
        })
        .when('/contact', {
            templateUrl: 'views/contact.html',
        })
        .otherwise({
            redirectTo: '/'
        });
});

myApp.config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});
