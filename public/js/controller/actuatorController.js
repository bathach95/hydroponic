controller.controller('ActuatorCtrl', function($http, $state, $stateParams, $window, $scope, $timeout, $q, ActuatorService, GetTimeService, flash){

  ActuatorService.getAllActuatorsByMac($stateParams.devicemac).then(function(result){
    $scope.listActuators = result.data.data;
  });

  $scope.newActuator = {
    devicemac: $stateParams.devicemac,
    actuator: {
      status: 'off'
    }
    }
  $scope.addActuator = function () {
    ActuatorService.addActuator($scope.newActuator).then(function(result){
      if (result.data.success) {
        $("#addActuatorModal").modal('hide');
        flash.success = result.data.message;
        bootbox.alert(result.data.message, function () {
            $state.reload();
        })

      } else {
        flash.error = result.data.message;
      }
    })
  }

})
