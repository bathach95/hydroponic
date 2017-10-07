service.service('CropService', function($http) {
    this.getAllCrops = function(deviceMac) {
        return $http.get('/crop/all', {
            params: {
                mac: deviceMac
            }
        })
    }

    this.getCropById = function(id) {
        return $http.get('crop/one', {
            params: {
                id: id
            }
        })
    }

    this.addCrop = function(newCrop){
      return $http.post('/crop/add', newCrop);
    }

    this.deleteCrop = function(crop){
      return $http.delete('/crop/delete', {
        params:crop
      });
    }

    this.editCrop = function(crop){
      return $http.put('/crop/edit', crop);
    }

    this.checkDataEditCrop = function(crop){

    }

    this.checkDataAddCrop = function(newCrop){
      var isErr = true;
      var message = '';

      if (newCrop.name === ''){
        message = "Empty name";
      } else if (newCrop.treetype === ''){
        message = "Empty tree type";
      } else if (newCrop.type === ''){
        message = "Empty type";
      } else if (newCrop.startdate === ''){
        message = "Empty start date";
      } else if (newCrop.closedate === ''){
        message = "Empty close date";
      } else if (newCrop.reporttime === 0){
        message = "Minimum report time is 1 minute";
      } else {
        isErr = false;
      }

      return {
        isErr : isErr,
        message: message
      }
    }
});
