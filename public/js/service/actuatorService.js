service.service('ActuatorService', function($http) {

    this.getAvailableActuator = function(currentActuatorList){
      var actuatorTypes = [{
        type: 'Water',
        numberOfActuator: [11, 12]
      }, {
        type : 'Fan',
        numberOfActuator: [31, 32]
      }, {
        type: 'Lighting',
        numberOfActuator: [21, 22]
      }, {
        type: 'Oxygen',
        numberOfActuator: [41, 42]
      }];
      
      var result = [];

      actuatorTypes.forEach(function(type){
        var currentActuators = currentActuatorList.filter(function(obj){
          return obj.type === type.type;
        })
        currentActuators.forEach(function(actuator, index){
          if (type.numberOfActuator.includes(actuator.idonboard)){
            type.numberOfActuator.splice(type.numberOfActuator.indexOf(actuator.idonboard), 1)
          }
        })
        
        type.numberOfActuator.forEach(function(availableId){
          result.push({type: type.type, availableId: availableId});
        })
      })
      return result;
    }

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
          idonboard: actuator.idonboard,
          priority: actuator.priority
        }
      })
    }
});
