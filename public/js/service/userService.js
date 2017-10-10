var service = angular.module('myApp.service', ['ngCookies']);

service.service('AuthService', function ($http) {
  return {
    isLoggedIn: isLoggedIn,
    checkEmptyLogin: checkEmptyLogin,
    checkEmptyReg: checkEmptyReg,
    checkEmptyUpdate: checkEmptyUpdate,
    checkDataChangePass: checkDataChangePass
  }

  function isLoggedIn() {
    var promise = new Promise(function (resolve, reject) {
      $http.get('/user/verifytoken').then(function (result) {
        if (result.data.success){
          resolve(result.data.data);
        } else {
          reject(result.data.message);
        }
      })
    })
    return promise;
  }

  function checkEmptyLogin(user) {
    if (user.email === '' || user.password === '') {
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

  function checkEmptyReg(user) {
    var isErr = true;
    var message = '';
    if (user.name === '') {
      message = "Empty name";
    } else if (user.password === '') {
      message = "Empty password";
    } else if (user.confirm_password === '') {
      message = "Empty confirm password";
    } else if (user.email === '') {
      message = "Empty email";
    } else if (user.password !== user.confirm_password) {
      message = "Password does not match";
    } else {
      isErr = false;
    }

    return {
      isErr: isErr,
      message: message
    }
  }

  function checkEmptyUpdate(user) {
    var isErr = true;
    var message = '';
    if (user.name === '') {
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

  function checkDataChangePass(data) {
    var isErr = true;
    var message = '';
    if (data.currPass === '') {
      message = "Empty current password";
    } else if (data.newPass === '') {
      message = "Empty new password";
    } else if (data.confNewPass === '') {
      message = "Empty confirm password";
    } else if (data.newPass !== data.confNewPass) {
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

service.service('UserService', function ($http, $cookieStore) {

  this.getUserRole = function (callback) {
    this.getUserDetail().then(function (result) {
      if (result.data.success) {
        callback(result.data.data.role);
      } else {
        callback(null);
      }
    })
  }

  this.getUserDetail = function () {
    return $http.get('/user/info');
  }

  this.register = function (user) {
    return $http.post('/user/register', user);
  }

  this.login = function (user) {
    return $http.post('/user/login', user);
  }

  this.update = function (user) {
    return $http.put('/user/update', user);
  }

  this.changePass = function (pass) {
    return $http.put('/user/changepass', pass);
  }

  this.resetPass = function (user) {
    return $http.post('/user/resetpass', user);
  }

  this.activeAccount = function (user) {
    return $http.put('/user/active', user);
  }

  this.logout = function () {
    // var cookies = $cookies.getAll();
    // angular.forEach(cookies, function (v, k) {
    //   $cookies.remove(k);
    // });
    $cookieStore.remove('token');
    $cookieStore.remove('name');
  }
});
