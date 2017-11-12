'use strict';

var myApp = angular.module('myApp',
    [
        'ngCookies',
        'ui.router',
        'ngRoute',
        'jkAngularRatingStars',
        'textAngular',
        'ngStorage',
        'angular-flash.service',
        'angular-flash.flash-alert-directive',
        'myApp.controllers',
        'myApp.factory',
        'myApp.service',
        'myApp.filter',
        'angular-async-validation',
        'angular-loading-bar'
      ]);

myApp.run(function ($rootScope, $cookies, $state, $transitions, $http, AuthService, flash) {

      // display username after login
    if (AuthService.isLoggedIn) {
        $rootScope.userLogin = $cookies.get('name');
    }

    $transitions.onStart( { to: 'login' }, function(trans) {
        var AuthService = trans.injector().get('AuthService');

        if (AuthService.isLoggedIn()){
            flash.success = "You are logged in"
            $state.go('home');
        }
      });

    $transitions.onStart({}, function (trans) {

        // scroll to top of the page when state changed
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        var access = trans.$to().access;
        var AuthService = trans.injector().get('AuthService');
        var UserService = trans.injector().get('UserService');

        if (access.requiredLogin && !AuthService.isLoggedIn()) {
            flash.error = 'You have log in to access this page';
            $state.go('login');
        } else if (AuthService.isLoggedIn()) {
            $rootScope.userLogin = $cookies.get('name');

            // if there are special roles to go to this state
            UserService.getUserRole(function (role) {
                if (role) {
                    $rootScope.userRole = role;
                    if (access.roles && !access.roles.includes(role)) {
                        flash.error = 'You cannot go to this page!';
                        $state.go('home');
                    }
                } else {
                    console.log('Cannot get role');
                }
            })
        }
    });

});

/* Loading bar */
myApp.config(function(cfpLoadingBarProvider) {
    cfpLoadingBarProvider.includeSpinner = true;
}).controller('LoadingBarCtrl', function($scope, $http, $timeout, cfpLoadingBar){

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
          url: '/profile.html',
          templateUrl: 'views/user/profile.html',
          controller: 'ProfileCtrl',
          access: {
              requiredLogin: true
          }
        })
        .state('article', {
            url: '/article.html',
            templateUrl: 'views/home/article/article.html',
            controller: 'ArticleCtrl',
            access: {
                requiredLogin: false
            }
        })
        .state('single_article', {
            url: '/article/:id',
            templateUrl: 'views/home/article/single-article.html',
            controller: 'SingleArticleCtrl',
            access: {
                requiredLogin: false
            }
        })
        .state('write_article', {
            url: '/writer.html',
            templateUrl: 'views/home/article/writer.html',
            controller: 'WriteArticleCtrl',
            access: {
                requiredLogin: true
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
            url: '/contact.html',
            templateUrl: 'views/home/contact.html',
            access: {
                requiredLogin: false
            }
        })
        .state('search_result', {
            url: '/search/:type/:data',
            templateUrl: 'views/home/search-result.html',
            controller: 'SearchResultCtrl',
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
        .state('registered', {
            url: '/register',
            templateUrl: 'views/registered.html',
            controller: 'RegisteredCtrl',
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
        .state('change_password', {
            url: '/changepass.html',
            templateUrl: 'views/changepass.html',
            controller: 'ProfileCtrl',
            access: {
                  requiredLogin: true
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
        .state('edit_profile', {
          url:'/profile/editprofile',
          templateUrl: 'views/user/editprofile.html',
          controller: 'ProfileCtrl',
          access: {
            requiredLogin: true
          }
        })
        .state('new_device', {
          url:'/profile/newdevice.html',
          templateUrl: 'views/user/add-new-device.html',
          controller: 'DeviceCtrl',
          access: {
            requiredLogin: true
          }
        })
        .state('device_detail', {
            url: '/device/:mac',
            templateUrl: 'views/device/device-detail.html',
            controller: 'DeviceDetailCtrl',
            access: {
                requiredLogin: true
            }
        })
        .state('crop_detail', {
            url: '/device/:devicemac/crop/:cropid',
            templateUrl: 'views/device/crop-detail.html',
            controller: 'CropDetailCtrl',
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
            templateUrl: 'views/private/user/admin.html',
            controller: 'AdminCtrl',
            access: {
                roles: ['admin'],
                requiredLogin: true
            }
        })
        .state('user_manager', {
            url: '/dashboard/user-management.html',
            templateUrl: 'views/private/user/manager.html',
            controller: 'UserManagementCtrl',
            access: {
                roles: ['admin'],
                requiredLogin: true
            }
        })
        .state('update_role', {
            url: '/dashboard/user-management/update-role/:id',
            templateUrl: 'views/private/user/update-role.html',
            controller: 'UpdateRoleCtrl',
            access: {
                roles: ['admin'],
                requiredLogin: true
            }
        })
        .state('mod', {
            url: '/mod.html',
            templateUrl: 'views/private/user/mod.html',
            controller: 'ModCtrl',
            access: {
                roles: ['mod'],
                requiredLogin: true
            }
        })
        .state('article_manager_admin', {
            url: '/mod/article-manager.html',
            templateUrl: 'views/private/article/manager_admin.html',
            controller: 'ArticleManagementCtrl',
            access: {
                roles: ['admin'],
                requiredLogin: true
            }
        })
        .state('article_manager_mod', {
            url: '/mod/article-manager.html',
            templateUrl: 'views/private/article/manager_mod.html',
            controller: 'ArticleManagementCtrl',
            access: {
                roles: ['mod'],
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
