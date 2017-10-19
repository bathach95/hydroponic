service.service('ActuatorService', function($http) {
    this.addActuator = function(actuator){
      return $http.post('/actuator/addactuator', actuator);
    }

    this.getAllActuatorsByMac = function(mac) {
      return $http.get('/actuator/all', {
        params: {
          mac: mac
        }
      });
    }
});
