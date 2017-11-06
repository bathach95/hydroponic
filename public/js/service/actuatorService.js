service.service('ActuatorService', function($http) {
    this.addActuator = function(actuator){
      return $http.post('/actuator/addactuator', actuator);
    }

    this.updateActuatorStatus = function(actuator) {
      return $http.put('/actuator/status', actuator);
    }

    this.getAllActuatorsByMac = function(mac) {
      return $http.get('/actuator/all', {
        params: {
          mac: mac
        }
      });
    }

    this.updateActuatorPriority = function(actuator) {
      return $http.put('/actuator/priority', actuator);
    }

    this.deleteActuator = function(actuator) {
      return $http.delete('/actuator/delete', {
        params:{
          id: actuator.id,
          mac: actuator.mac,
          priority: actuator.priority
        }
      })
    }
});
