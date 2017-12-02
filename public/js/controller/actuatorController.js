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

  $scope.toggleActuator = function (index, idonboard, id, newstatus) {
    bootbox.confirm('Do you want to turn ' + newstatus + ' this actuator?', function (yes) {
      if (yes) {
        var actuator = {
          id: id,
          status: newstatus,
          mac: $stateParams.mac,
          idonboard: idonboard
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
    });
  }

  $scope.changeActuatorPriority = function(index, idonboard, id, priority){
    var newPriority = priority === 'Primary'? 'Secondary' : 'Primary';
    bootbox.confirm('Do you want to change priority of this device to \'' + newPriority + '\' ?', function (yes) {
      if (yes) {
        var actuator = {
          id: id,
          mac: $stateParams.mac,
          idonboard: idonboard,
          priority: newPriority
        }
        ActuatorService.updateActuatorPriority(actuator).then(function (result) {
          if (result.data.success) {
            $scope.listActuators[index].priority = newPriority;
            flash.success = result.data.message;
          } else {
            flash.error = result.data.message;
          }
        })
      };
    });
  }

  $scope.deleteActuator = function (idonboard, id, priority) {

    bootbox.confirm('Do you want to delete this device ?', function (yes) {
      if (yes) {
        var actuator = {
          id: id,
          mac: $stateParams.mac,
          idonboard: idonboard,
          priority: priority
        }
        ActuatorService.deleteActuator(actuator).then(function (result) {
          if (result.data.success) {
            flash.success = result.data.message;
            $state.reload();
          } else {
            flash.error = result.data.message;
          }
        })
      }
    })
  }
})
