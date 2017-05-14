var controller = angular.module('myApp.controllers', []);

controller.controller('DeviceCtrl', function($http, $routeParams, $scope, DeviceService, CropService){

  $scope.deviceMac = $routeParams.mac;

  DeviceService.getDeviceByMac($routeParams.mac).then(function(result){
    $scope.device = result.data;
  });

  // get all crops of device
  CropService.getAllCrops($routeParams.mac).then(function(result){
    $scope.cropList = result.data;
  });

});

controller.controller('CropCtrl', function($http, $routeParams, $scope, CropService){

  CropService.getCropById($routeParams.cropid).then(function(result){
    $scope.crop = result.data;
  })
});

controller.controller('ScheduleCtrl', function($http, $routeParams, $scope){
  console.log($routeParams);
});

controller.controller('ThresholdCtrl', function($http, $routeParams, $scope){
  console.log($routeParams);
});

controller.controller('DataCtrl', function($http, $routeParams, $scope){
  console.log($routeParams);
});
