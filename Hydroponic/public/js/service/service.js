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
      } else if (user.email === ''){
        message = "Empty email";
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
        return $http.post('/user/update', user);
    }

    this.changePass = function(pass){
        return $http.post('/user/changepass', pass);
    }

    this.logout = function() {
        delete $localStorage.token;
        delete $localStorage.name;
        delete $localStorage.email;
        delete $localStorage.phone;
    }
});

service.service('DeviceService', function($http) {

    this.getAllDevices = function(email) {
        return $http.get('/device/all', {
            params: {
                email: email
            }
        });
    }

    this.getDeviceByMac = function(mac) {
        return $http.get('/device/one', {
            params: {
                mac: mac
            }
        });
    }


});

service.service('CropService', function($http) {
    this.getAllCrops = function(deviceMac) {
        return $http.get('/crop/all', {
            params: {
                mac: deviceMac
            }
        })
    }

    this.getCropById = function(id) {
        return $http.get('crop/one', {
            params: {
                id: id
            }
        })
    }
});

service.service('ThresholdService', function($http) {
    this.getNewestThresholdByCropId = function(cropId) {
        return $http.get('/threshold/newest', {
            params: {
                cropId: cropId
            }
        })
    }
});

service.service('DataService', function($http) {
    this.getNewestDataByCropId = function(cropId) {
        return $http.get('/data/newest', {
            params: {
                cropId: cropId
            }
        })
    }

    this.getAllData = function(cropId) {
        return $http.get('/data/all', {
            params: {
                cropId: cropId
            }
        })
    }
});

service.service('GetTimeService', function() {
    return {
        getDateTime: getDateTime
    }
    // get date and time from string "2017-05-14T09:46:00.000Z"
    function getDateTime(data) {
        var dateTime = data.split('T');
        var dateGMT = dateTime[0];
        var timeGMT = dateTime[1].split('.')[0];

        // get local time
        var dateObject = new Date(dateGMT + " " + timeGMT + " UTC");
        var localDateTime = dateObject.toString().split(" ");
        var date = '';
        for (var i = 1; i < 4; i++) {
            date += localDateTime[i] + " ";
        }
        var time = localDateTime[4];
        return {
            date: date,
            time: time
        }
    }
});

service.service('DataStatusService', function() {
    return {
        getStatus: getStatus
    }

    function getStatus(data, threshold) {

        var status = {
            badStatus: {
                temp: data.temperature < threshold.temperatureLower || data.temperature > threshold.temperatureUpper,
                humidity: data.humidity < threshold.humidityLower || data.humidity > threshold.humidityUpper,
                ppm: data.ppm < threshold.ppmLower || data.ppm > threshold.ppmUpper,
                ph: data.ph < threshold.phLower || data.ph > threshold.phUpper
            }
        }

        status.status = status.badStatus.temp || status.badStatus.humidity || status.badStatus.ppm || status.badStatus.ph;
        return status;
    }
});
