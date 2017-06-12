service.service('DeviceService', function($http) {

    this.getAllDevicesByEmail = function(email) {
        return $http.get('/device/all', {
            params: {
                email: email
            }
        });
    }

    this.getDeviceByMac = function(mac) {
        return $http.get('/device/one', {
            params: {
                mac: mac
            }
        });
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
