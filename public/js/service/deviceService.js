service.service('DeviceService', function($http) {

    this.getAllDevicesByUserId = function() {
        return $http.get('/device/all');
    }

    this.getRunningDevice = function() {
      return $http.get('/device/running');
    }

    this.getDeviceByMac = function(mac) {
        return $http.get('/device/one', {
            params: {
                mac: mac
            }
        });
    }

    this.updateStatus = function(device) {
      return $http.put('device/status', device);
    }

    this.addDevice = function(device){
      return $http.post('/device/add', device);
    }
// 18:FE:34:E5:E2:3C
    this.checkDataAddDevice = function(device){
      var isErr = true;
      var message = '';
      if (device.mac === ''){
        message = "Empty mac";
      } else if (!(/^([0-9A-Za-z][0-9A-Za-z]:){5}[0-9A-Za-z][0-9A-Za-z]$/.test(device.mac))) {
        message = "Wrong MAC format"
      } else if (device.name === ''){
        message = "Empty name";
      } else {
        isErr = false;
      }

      return {
        isErr: isErr,
        message: message
      }
    }

    this.deleteDevice = function(device){
      return $http.delete('/device/delete', {
        params: device
      });
    }
});
