controller.controller('DeviceManageCtrl', function ($scope, $http, $window, Upload, flash) {
    // upload later on form submit or something similar
    $scope.submit = function() {
        if ($scope.form.file.$valid && $scope.file) {
          $scope.upload($scope.file);
        }
      };
  
      // upload on file select or drop
      $scope.upload = function (file) {
          Upload.upload({
              url: 'http://localhost:3210/device/upload',
              method: 'POST',
              data: {file: file}
          }).then(function (resp) {
              if (resp.data.success) {
                  flash.success = resp.data.message;
              } else {
                  flash.error = "Cannot upload file";
              }
              console.log(resp.data);
          }, function (resp) {
              console.log('Error status: ' + resp.status);
          }, function (evt) {
              var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
              console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
          });
      };
})
