var controller = angular.module('myApp.controllers', []);

controller.controller('LoginCtrl', function($scope, $rootScope, $cookies, $window, UserService) {
    $scope.user = {
        email: '',
        password: ''
    };
    $scope.login = function() {
        UserService.login($scope.user).then(function(result) {
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
                $cookies.put('email', result.data.data.email, {
                    expires: day
                });
                $cookies.put('phone', result.data.data.phone, {
                    expires: day
                });
                //------------------
                window.alert('Login success!');
            } else window.alert('Login failed!');
        });
    }

    $scope.logout = function() {
        UserService.logout();
        var url = "http://" + $window.location.host + "/";
        $window.location.href = url;
    }

    $rootScope.userLogin = $cookies.get('username');
});

controller.controller('RegisterCtrl', function($http, $scope, UserService) {
    $scope.user = {
        name: '',
        password: '',
        email: '',
        phone: ''
    };
    $scope.register = function() {
        UserService.register($scope.user).then(function(result) {
            console.log(result.data);
            if (result.data.success) {
                window.alert('Register success!');
            } else window.alert('Register failed!');
        });
    }
});

controller.controller('ProfileCtrl', function($http, $window, $scope, $cookies, DeviceService, UserService) {
    // display all devices of user

    DeviceService.getAllDevices($cookies.get('email')).then(function(result) {
        $scope.listDevice = result.data;
    });

    // display user infos
    $scope.user = {
        name: $cookies.get('username'),
        email: $cookies.get('email'),
        phone: $cookies.get('phone')
    }
    // update infos
    $scope.userUpdate = {
        email: $cookies.get('email'),
        name: '',
        phone: ''
    }

    // TODO: check empty name and phone before update
    $scope.update = function() {
        UserService.update($scope.userUpdate).then(function(result) {
            $cookies.put('phone', $scope.userUpdate.phone);
            $cookies.put('username', $scope.userUpdate.name);
            window.alert(result.data);
            $window.location.reload();
        });
    }

    //----- change pass -----------
    $scope.pass = {
        currPass: '',
        newPass: '',
        confNewPass: ''
    }

});
