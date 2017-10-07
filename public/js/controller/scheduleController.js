controller.controller('ScheduleCtrl', function($http, $routeParams, $scope, ScheduleService) {
  ScheduleService.getScheduleByCropId($routeParams.cropid).then(function(result){
    $scope.selectedActuator = 1;
    //var obj = result.data.filter(function(item){
    //  return item.actuatorid === $scope.selectedActuator;
    //})[0];
    //$scope.turnonevery = obj.turnonevery;
    $scope.scheduleListWatering = result.data.watering;
    $scope.scheduleTypeSelected = 'watering';
  })
  $scope.typeSelected = function(type) {
    $scope.scheduleTypeSelected = type;
  }

});

controller.controller('ScheduleSettingCtrl', function($http, $window, $routeParams, $scope, $route, $timeout, ScheduleService) {
  ScheduleService.getScheduleByCropId($routeParams.cropid).then(function(result){
    $scope.selectedActuatorId = 1;
    $scope.scheduleSettingTypeSelected = 'watering';
    $scope.scheduleSettingListWatering = result.data.watering;
    $scope.scheduleSettingListFan = result.data.fan;
    $scope.scheduleSettingListLighting = result.data.lighting;
    $scope.scheduleSettingListOxygen = result.data.oxygen;
  })
  $scope.typeSettingSelected = function(type) {
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
            CropId: $routeParams.cropid
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
      ScheduleService.deleteScheduleSettingByCropId($routeParams.cropid).then(function(result){
        console.log("Controller delete schedule successfully!");
      })

      var listScheduleSetting = {
        cropId: $routeParams.cropid,
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
});
