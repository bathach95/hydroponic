service.service('ScheduleService', function($http){
  this.getScheduleByCropId = function(cropId){
    return $http.get('/schedule/all', {
      params:{
        cropId: cropId
      }
    })
  }

  this.deleteScheduleSettingByCropId = function(cropId){
    return $http.delete('/schedule/delete', {
      params:{
        cropId: cropId
      }
    });
  }

  this.addScheduleSetting = function(scheduleSetting){
    return $http.post('/schedule/add', scheduleSetting);
  }

})
