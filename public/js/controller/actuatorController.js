controller.controller('ActuatorCtrl', function($http, $state, $stateParams, $window, $scope, $timeout, $q, ActuatorService, GetTimeService, flash){

  $scope.dataTableOpt = {
    "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50,'All']],
  };

  ActuatorService.getAllActuatorsByMac($stateParams.mac).then(function(result){
    $scope.listActuators = result.data.data;
  });

  $scope.newActuator = {
    devicemac: $stateParams.mac,
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

  $scope.toggleActuator = function (index, actuatorid, id, newstatus) {
    var actuator = {
      id: id,
      status: newstatus,
      mac: $stateParams.mac,
      actuatorid: actuatorid
    }
    ActuatorService.updateActuatorStatus(actuator).then(function (result) {
      if (result.data.success) {
        $scope.listActuators[index].status = newstatus;
        flash.success = result.data.message;
      } else {
        flash.error = result.data.message;
      }
    })
  }

})
