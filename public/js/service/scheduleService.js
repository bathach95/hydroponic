service.service('ScheduleService', function($http){
  this.getScheduleByCropId = function(cropId){
    return $http.get('/schedule/all', {
      params:{
        cropId: cropId
      }
    })
  }

  this.deleteScheduleSettingByCropId = function(cropId){
    console.log("Service");
    return $http.delete('/schedule/delete', {
      params:{
        cropId: cropId
      }
    });
  }

  this.addScheduleSetting = function(listScheduleSetting){
    return $http.post('/schedule/add', listScheduleSetting);
  }

})
