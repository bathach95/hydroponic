var service = angular.module('myApp.service',['ngCookies']);

service.service('AuthService', function($cookies){
  return {
    isLoggedIn: isLoggedIn
  }
  function isLoggedIn(){
    if ($cookies.get('token')){
      return true;
    } else {
      console.log("User is not logged in!");
      return false;
    }
  }
});

service.service('UserService', function($cookies, $http){
  this.register = function(user){
    return $http.post('/user/register', user);
  }

  this.login = function(user){
    return $http.post('/user/login', user);
  }

  this.update = function(user){
    return $http.post('/user/update', user);
  }

  this.logout = function(){
    $cookies.remove('token');
    $cookies.remove('username');
    $cookies.remove('email');
    $cookies.remove('phone');
  }
});

service.service('DeviceService', function($http){

  this.getAllDevices = function(email){
    return $http.get('/device/all', {
      params: {
        email: email
      }
    });
  }

  this.getDeviceByMac = function(mac){
    return $http.get('/device/one',{
      params: {
        mac: mac
      }
    });
  }


});

service.service('CropService', function($http){
  this.getAllCrops = function(deviceMac){
    return $http.get('/crop/all', {
      params: {
        mac: deviceMac
      }
    })
  }

  this.getCropById = function(id){
    return $http.get('crop/one', {
      params: {
        id: id
      }
    })
  }
});

service.service('ThresholdService', function($http){
  this.getNewestThresholdByCropId = function(cropId){
    return $http.get('/threshold/newest', {
      params: {
        cropId: cropId
      }
    })
  }
});

service.service('DataService', function($http){
  this.getNewestDataByCropId = function(cropId){
    return $http.get('/data/newest', {
      params: {
        cropId: cropId
      }
    })
  }

  this.getAllData= function(cropId){
    return $http.get('/data/all', {
      params: {
        cropId: cropId
      }
    })
  }
});

service.service('GetTimeService', function(){
  return {
    getDateTime: getDateTime
  }
  // get date and time from string "2017-05-14T09:46:00.000Z"
  function getDateTime(data){
    var dateTime = data.split('T');
    var dateGMT = dateTime[0];
    var timeGMT = dateTime[1].split('.')[0];

    // get local time
    var dateObject = new Date(dateGMT + " " + timeGMT);
    console.log(dateObject);
    var localDateTime = dateObject.toString().split(" ");
    var date = '';
    for (var i = 1; i < 4; i++){
      date += localDateTime[i] + " ";
    }
    var time = localDateTime[4];
    return {
      date: date,
      time: time
    }
  }
})
