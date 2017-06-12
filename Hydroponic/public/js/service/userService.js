var service = angular.module('myApp.service', []);

service.service('AuthService', function($localStorage) {
    return {
        isLoggedIn: isLoggedIn,
        checkEmptyLogin: checkEmptyLogin,
        checkEmptyReg: checkEmptyReg,
        checkEmptyUpdate: checkEmptyUpdate,
        checkDataChangePass: checkDataChangePass
    }

    function isLoggedIn() {
        if ($localStorage.token) {
            return true;
        } else {
            return false;
        }
    }

    function checkEmptyLogin(user){
      if (user.email === '' || user.password === ''){
        return {
          isErr: true,
          message: "Empty email or password"
        };
      } else {
        return {
          isErr: false
        };
      }
    }

    function checkEmptyReg(user){
      var isErr = true;
      var message = '';
      if (user.name === ''){
        message = "Empty name";
      } else if (user.password === ''){
        message = "Empty password";
      } else if (user.confirm_password === ''){
        message = "Empty confirm password";
      } else if (user.email === ''){
        message = "Empty email";
      } else if (user.password !== user.confirm_password){
        message = "Password does not match";
      } else {
        isErr = false;
      }

      return {
        isErr: isErr,
        message: message
      }
    }

    function checkEmptyUpdate(user){
      var isErr = true;
      var message = '';
      if (user.name === ''){
        message = "You must retype or change your name";
      } else if (user.phone === '') {
        message = "You must retype or change your phone number";
      } else {
        isErr = false;
      }

      return {
        isErr: isErr,
        message: message
      }
    }

    function checkDataChangePass(data){
      var isErr = true;
      var message = '';
      if (data.currPass === ''){
        message = "Empty current password";
      } else if (data.newPass === '') {
        message = "Empty new password";
      } else if (data.confNewPass === ''){
        message = "Empty confirm password";
      } else if (data.newPass !== data.confNewPass){
        message = "New password does not match";
      } else {
        isErr = false;
      }

      return {
        isErr: isErr,
        message: message
      }
    }
});

service.service('UserService', function($localStorage, $http) {
    this.register = function(user) {
        return $http.post('/user/register', user);
    }

    this.login = function(user) {
        return $http.post('/user/login', user);
    }

    this.update = function(user) {
        return $http.put('/user/update', user);
    }

    this.changePass = function(pass){
        return $http.put('/user/changepass', pass);
    }

    this.logout = function() {
        delete $localStorage.token;
        delete $localStorage.name;
        delete $localStorage.email;
        delete $localStorage.phone;
    }
});
