'use strict';

var myApp = angular.module('myApp',
    ['ngCookies',
        'ui.router',
        'ngRoute',
        'ngStorage',
        'angular-flash.service',
        'angular-flash.flash-alert-directive',
        'myApp.controllers',
        'myApp.factory',
        'myApp.service',
        'myApp.filter']);

myApp.run(function ($rootScope, $cookies, flash, $state, $transitions, AuthService) {

    $transitions.onStart({}, function (trans) {

        // scroll to top of the page when state changed
        document.body.scrollTop = document.documentElement.scrollTop = 0;


        if (trans.$from().params.isAdmin) {
            console.log(trans.$from().params.isAdmin.obj);

        }

        var access = trans.$to().access;
        var MyAuthService = trans.injector().get('AuthService');

        if (access.requiredLogin && !MyAuthService.isLoggedIn()) {
            flash.error = 'You have log in to access this page';
            $state.go('login');
        } else if (MyAuthService.isLoggedIn()) {

        }
    });

});

/* push auth provider to the http request */
myApp.config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
});

/* error message */
myApp.config(['flashProvider', function (flashProvider) {
    flashProvider.errorClassnames.push('alert-danger');
    flashProvider.warnClassnames.push('alert-warning');
    flashProvider.infoClassnames.push('alert-info');
    flashProvider.successClassnames.push('alert-success');
}]);

/* app routing */
myApp.config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $locationProvider.hashPrefix('!');

    $stateProvider
        .state('home', {
            url: '/',
            templateUrl: 'views/home/index.html',
            access: {
                requiredLogin: false
            }
        })
        .state('system', {
            url: '/system',
            templateUrl: 'views/home/services.html',
            access: {
                requiredLogin: false
            }
        })
        .state('article', {
            url: '/article.html',
            templateUrl: 'views/home/single.html',
            access: {
                requiredLogin: false
            }
        })
        .state('about', {
            url: '/about.html',
            templateUrl: 'views/home/about.html',
            access: {
                requiredLogin: false
            }
        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'views/home/contact.html',
            access: {
                requiredLogin: false
            }
        })
        .state('login', {
            url: '/login.html',
            templateUrl: 'views/login.html',
            controller: 'LoginCtrl',
            access: {
                requiredLogin: false
            }
        })
        .state('register', {
            url: '/register.html',
            templateUrl: 'views/register.html',
            controller: 'RegisterCtrl',
            access: {
                requiredLogin: false
            }
        })
        .state('active_account', {
            url: '/user/active/:email/:token',
            templateUrl: 'views/notice.html',
            controller: 'ActiveUserCtrl',
            access: {
                requiredLogin: false
            }
        })
        .state('resetpass', {
            url: '/resetpass.html',
            templateUrl: 'views/resetpass.html',
            controller: 'ResetPassCtrl',
            access: {
                requiredLogin: false
            }
        })
        .state('profile', {
            url: '/profile.html',
            templateUrl: 'views/user/profile.html',
            controller: 'ProfileCtrl',
            access: {
                requiredLogin: true
            }
        })
        .state('device-detail', {
            url: '/device/:mac',
            templateUrl: 'views/device/device-detail.html',
            controller: 'DeviceCtrl',
            access: {
                requiredLogin: true
            }
        })
        .state('crop_detail', {
            url: '/device/:devicemac/crop/:cropid',
            templateUrl: 'views/device/crop-detail.html',
            access: {
                requiredLogin: true
            }
        })
        .state('all_data', {
            url: '/device/:devicemac/crop/:cropid/alldata',
            templateUrl: 'views/device/all-logs.html',
            controller: 'AllLogCtrl',
            access: {
                requiredLogin: true
            }
        })
        .state('admin', {
            url: '/dashboard.html',
            templateUrl: 'views/user/admin.html',
            params: {
                isAdmin: null
            },
            access: {
                requiredLogin: true
            }
        })
        .state('404', {
            url: '/404.html',
            templateUrl: 'views/404.html',
            access: {
                requiredLogin: false
            }
        })
});

