service.service('ScheduleService', function($http){
  this.getScheduleByCropId = function(cropId){
    return $http.get('/schedule/all', {
      params:{
        cropId: cropId
      }
    })
  }

  this.deleteScheduleSettingById = function(scheduleId){
    return $http.delete('/schedule/delete', {
      params:{
        scheduleId: scheduleId
      }
    });
  }

  this.addScheduleSetting = function(scheduleSetting){
    return $http.post('/schedule/add', scheduleSetting);
  }

  this.syncScheduleSettings = function(cropId, mac) {
    return $http.get('/schedule/sync', {
      params:{
        cropId: cropId,
        mac: mac
      }
    });
  }
})
