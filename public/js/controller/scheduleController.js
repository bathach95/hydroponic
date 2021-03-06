controller.controller('ScheduleCtrl', function($http, $stateParams, $state, $scope, $timeout, ScheduleService, flash) {
$scope.deviceMac = $stateParams.mac;
$scope.cropId = $stateParams.cropid;
console.log($stateParams.cropid)
  ScheduleService.getScheduleByCropId($stateParams.cropid).then(function(result){
    console.log(result);
    $scope.listSchedule = result.data.data;
  })

  $scope.deleteSchedule = function (scheduleId) {
    bootbox.confirm("Do you want to delete this setting?", function (result) {
      if (result)
      {
        ScheduleService.deleteScheduleSettingById(scheduleId).then(function(result){
          if (result.data.success)
          {
            flash.success = result.data.message;
            $state.reload();
          }
          else {
            flash.error = result.data.message;
          }
        })
      }
    })
  }

  $scope.syncScheduleSettings = function(cropId, mac) {
    $("#syncButton").button('loading');
    $(".overlay").show();
    setTimeout(function () {
      ScheduleService.syncScheduleSettings(cropId, mac).then(function(result) {
        $("#syncButton").button('reset');
        $(".overlay").hide();
        if (result.data.success)
        {
          console.log(result.data.data);
          flash.success = result.data.message;
        }
        else {
          flash.error = result.data.message;
        }
      })
    }, 1000);
  }
});

controller.controller('ScheduleSettingCtrl', function($http, $window, $stateParams, $state, $scope, $route, $timeout, ScheduleService, ActuatorService, flash) {

  $scope.newSchedule = {}

  $scope.newSchedule = {
    CropId: $stateParams.cropid,

  }

  ActuatorService.getAllActuatorsByMac($stateParams.devicemac).then(function(result){
    $scope.listActuators = result.data.data;
  });

  $scope.addSchedule = function() {
    var starttimeString = moment($scope.newSchedule.starttime).format('HH:mm:ss');

    var endtimeString = moment($scope.newSchedule.endtime).format('HH:mm:ss')

    var newScheduleItem ={
        CropId: parseInt($scope.newSchedule.CropId),
        ActuatorId: $scope.newSchedule.ActuatorId,
        starttime: starttimeString,
        endtime: endtimeString,
        intervaltime: $scope.newSchedule.intervaltime,
        delaytime: $scope.newSchedule.delaytime
      }
    $('#addScheduleModal').modal('toggle');
    ScheduleService.addScheduleSetting(newScheduleItem).then(function(result){
      if (result.data.success)
      {
        flash.success = result.data.message;
      }
      else {
        flash.error = result.data.message;
      }
      $state.reload();
    })
  }
});
