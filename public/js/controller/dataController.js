
controller.controller('DataCtrl', function ($http, $stateParams, $rootScope, $scope, DataService, GetTimeService, DataStatusService, ThresholdService) {
  $scope.deviceMac = $stateParams.devicemac;
  $scope.cropId = $stateParams.cropid;

  DataService.getNewestDataByCropId($scope.cropId).then(function (dataResult) {
    if (dataResult.data.success) {

      $scope.data = dataResult.data.data;
      // status of data

      ThresholdService.getNewestThresholdByCropId($scope.cropId).then(function(thresholdResult) {
        if (thresholdResult.data.data)
        {
          var status = DataStatusService.getStatus(dataResult.data.data, thresholdResult.data.data);
          $scope.threshold = thresholdResult.data.data;
          $scope.badStatus = status.badStatus;
          $scope.status = status.status;
        }
      });
    }
  })

  $scope.refreshLatestData = function() {
    $("#refreshDataButton").button("loading");
    $(".overlay").show();
    setTimeout(function () {
      DataService.getNewestDataByCropId($scope.cropId).then(function (dataResult) {
        $("#refreshDataButton").button("reset");
        $(".overlay").hide();
        if (dataResult.data.success) {

          $scope.data = dataResult.data.data;
          // status of data

          ThresholdService.getNewestThresholdByCropId($scope.cropId).then(function(thresholdResult) {
            if(thresholdResult.data.data)
            {
              var status = DataStatusService.getStatus(dataResult.data.data, thresholdResult.data.data);
              $scope.threshold = thresholdResult.data.data;
              $scope.badStatus = status.badStatus;
              $scope.status = status.status;
            }
            else {

            }
          });
        }
        else {

        }
      })
    }, 1000);
  }
});

controller.controller('HomePageDataCtrl', function ($http, $stateParams, $rootScope, $scope, DataService, GetTimeService, DataStatusService, DeviceService, ThresholdService) {

var runningDevicesData = []
  if ($scope.userLogin)
  {
    new Promise(function(resolve, reject){
      DeviceService.getRunningDevice().then(function(result){
        if (result.data.success)
        {
          Promise.all(result.data.data.map(function(item){
            return new Promise(function(resolve, reject){
              ThresholdService.getNewestThresholdByCropId(item.crop.id).then(function(thresholdResult) {
                  var status;
                  if (thresholdResult.data.success)
                  {
                    status = DataStatusService.getStatus(item.data, thresholdResult.data.data);
                  }
                  else
                  {
                    status = {
                      badStatus:{
                        temp: false,
                        humidity: false,
                        ppm: false,
                        light: false
                      },
                      status: false
                    }
                  }
                  runningDevicesData.push({devicecropdata: item, status: status});
                  resolve(status);
                });
            });
          })).then(function(result)
          {
            //resolve(result);
          })
        }
        else
        {
            console.log("Not OK!!");
        };
      }).then(function(result){
        resolve(result);
      })
    }).then(function(){
      $scope.runningDevicesData = runningDevicesData;
      console.log(runningDevicesData);
    })
  }
});

controller.controller('AllLogCtrl', function ($http, $stateParams, $scope, ThresholdService, DataService, GetTimeService, DataStatusService, flash) {
  // get threshold to compare
  //
  $scope.devicemac = $stateParams.devicemac;
  $scope.cropid = $stateParams.cropid;
  $scope.dataTableOpt = {
  "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50,'All']],
  };

  DataService.getAllData($stateParams.cropid).then(function (result) {

    if (result.data.success) {
      $scope.data = result.data.data;

      ThresholdService.getNewestThresholdByCropId($stateParams.cropid).then(function (thresholdResult) {
        $scope.threshold = thresholdResult.data.data;
        $scope.data.forEach(function (item) {
          //----status----
          var status = {
            badStatus: {
              temp: false,
              humidity: false,
              ppm: false,
              light: false
            },
            status: false
          }
          if (thresholdResult.data.success){
            status = DataStatusService.getStatus(item, $scope.threshold);
          }
          item.badStatus = status.badStatus;
          item.status = status.status;
          //--------------
        });
        var labels = [];
        var temperaturedata = [];
        var humiditydata = [];
        var ppmdata = [];
        var phdata = [];
        if (result.data.data.length > 10)
        {
          for (i = 0; i < 10; i++)
          {
            labels.unshift(moment(result.data.data[i].createdAt).format('DD-MM-YYYY HH:mm:ss'));
            temperaturedata.unshift(result.data.data[i].temperature);
            humiditydata.unshift(result.data.data[i].humidity);
            ppmdata.unshift(result.data.data[i].ppm);
            phdata.unshift(result.data.data[i].ph);
          }
        }
        else {
          for (i = 0; i < result.data.data.length; i++)
          {
            labels.unshift(moment(result.data.data[i].createdAt).format('DD-MM-YYYY HH:mm:ss'));
            temperaturedata.unshift(result.data.data[i].temperature);
            humiditydata.unshift(result.data.data[i].humidity);
            ppmdata.unshift(result.data.data[i].ppm);
            phdata.unshift(result.data.data[i].ph);
          }
        }
        $scope.labels = labels;
        $scope.seriesPH = ['pH', 'Threshold'];
        $scope.seriesPPM = ['ppm', 'Threshold'];
        $scope.seriesTemperature = ['Temperature', 'Threshold'];
        $scope.seriesHumidity = ['Humidity', 'Threshold'];
        $scope.dataPH = [
          phdata
        ];
        $scope.dataPPM = [
          ppmdata
        ];
        $scope.dataTemperature = [
          temperaturedata
        ];
        $scope.dataHumidity = [
          humiditydata
        ];
        $scope.onClick = function (points, evt) {
          console.log(points, evt);
        };
        $scope.datasetOverride = [{ yAxisID: 'y-axis-1' }];
        $scope.options = {
          scales: {
            yAxes: [
              {
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left'
              }
            ]
          }
        };
      });
    } else {
      flash.error = result.data.message;
    }
  });
});
