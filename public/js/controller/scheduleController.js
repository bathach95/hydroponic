controller.controller('ScheduleCtrl', function($http, $stateParams, $state, $scope, $timeout, ScheduleService, flash) {
$scope.deviceMac = $stateParams.mac;
$scope.cropId = $stateParams.cropid;
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
  /*ScheduleService.getScheduleByCropId($stateParams.cropid).then(function(result){
    $scope.selectedActuatorId = 1;
    $scope.scheduleSettingTypeSelected = 'watering';
    $scope.scheduleSettingListWatering = result.data.watering;
    $scope.scheduleSettingListFan = result.data.fan;
    $scope.scheduleSettingListLighting = result.data.lighting;
    $scope.scheduleSettingListOxygen = result.data.oxygen;
  })*/
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

  /*$scope.typeSettingSelected = function(type) {
    $scope.scheduleSettingTypeSelected = type;
  }

  $scope.insRow = function(scheduleType) {
    if (this.timeto== null || this.timefrom == null || this.delaytime == null || this.lasttime == null)
    {
      bootbox.alert("Please input completely time!");
    }
    else
    {
      var date = new Date();
      this.timeto.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      this.timefrom.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      if (this.timefrom <= this.timeto)
      {
        var obj = {
            type: $scope.scheduleSettingTypeSelected,
            actuatorid: $scope.selectedActuatorId,
            turnonevery: 1,
            timefrom: this.timefrom.toLocaleTimeString("vi-VN",{hour12:false}),
            timeto: this.timeto.toLocaleTimeString("vi-VN",{hour12:false}),
            delaytime: this.delaytime,
            lasttime: this.lasttime,
            CropId: $stateParams.cropid
        };
        switch ($scope.scheduleSettingTypeSelected) {
          case 'watering':
            var index = checkNewScheduleItem($scope.scheduleSettingListWatering, obj)
            if (index != null)
              $scope.scheduleSettingListWatering.splice(index, 0, obj);
            else
              bootbox.alert("Overlap Time Settings! Please re-enter again.");
            break;
          case 'fan':
            $scope.scheduleSettingListFan.push(obj);
            break;
          case 'lighting':
            $scope.scheduleSettingListLighting.push(obj);
            break;
          case 'oxygen':
            $scope.scheduleSettingListOxygen.push(obj);
            break;
          default:
        };
        this.timeto = null;
        this.timefrom = null;
        this.delaytime = null;
        this.lasttime = null;
      }
      else {
        bootbox.alert("Please choose start time before end time!");
      }
    }
  }

  function checkNewScheduleItem(list, item){
    for (i = 0; i < list.length; i++)
    {
      if (item.actuatorid == list[i].actuatorid)
      {
        if (item.timefrom >= list[i].timeto)
          continue;
        else
        {
          if (item.timefrom <= list[i].timefrom)
          {
            if (item.timeto > list[i].timefrom)
              return null;
            else
              return i;
          }
          else
          {
            return null
          }
        }
      }
    }
    return list.length;
  }
  $scope.deleteRow = function(scheduleSettingTypeSelected, row){
    switch (scheduleSettingTypeSelected) {
      case 'watering':
        var i = $scope.scheduleSettingListWatering.indexOf(row.schedule);
        $scope.scheduleSettingListWatering.splice(i, 1);
        break;
      case 'fan':
        var i = $scope.scheduleSettingListFan.indexOf(row.schedule);
        $scope.scheduleSettingListFan.splice(i, 1);
        break;
      case 'lighting':
        var i = $scope.scheduleSettingListLighting.indexOf(row.schedule);
        $scope.scheduleSettingListLighting.splice(i, 1);
        break;
      case 'oxygen':
        var i = $scope.scheduleSettingListOxygen.indexOf(row.schedule);
        $scope.scheduleSettingListOxygen.splice(i, 1);
        break;
      default:
    };
  }

  $scope.cancelScheduleSetting = function() {
      // console.log("Schedule Setting canceled!");
       $timeout(function(){
      //   // 1 second delay, might not need this long, but it works.
         $route.reload();
       }, 1000);
    }
  function reload(){
    $window.location.reload();
  }
  $scope.saveAndApply = function() {

      ScheduleService.deleteScheduleSettingByCropId($stateParams.cropid).then(function(result){
        console.log("Controller delete schedule successfully!");
      })

      var listScheduleSetting = {
        cropId: $stateParams.cropid,
        watering: $scope.scheduleSettingListWatering,
        fan: $scope.scheduleSettingListFan,
        lighting: $scope.scheduleSettingListLighting,
        oxygen: $scope.scheduleSettingListOxygen
      };
      ScheduleService.addScheduleSetting(listScheduleSetting).then(function(result){
        console.log("Controller - Add schedule successfully!");
      });

      $('#program-settings').modal('toggle');
      bootbox.alert("Saved and applied program settings!", function(){
        setTimeout(reload, 1000);
      });
    };
    */
});
