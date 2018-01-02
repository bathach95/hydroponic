controller
  .controller('CropCtrl', function ($http, $state, $stateParams, $scope, CropService, GetTimeService, flash) {
    $scope.deviceMac = $stateParams.mac;
    /* get all crops of device */
    CropService.getAllCrops($stateParams.mac).then(function (result) {

      if (result.data.success) {
        $scope.cropList = result.data.data;
      } else {
        flash.error = result.data.message;
      }
    });

    /* add new crop to device */
    $scope.newCrop = {
      DeviceMac: $stateParams.mac,
      status: 'pending',
      synchronized: true,
      reporttime: 3 // default value of report time is 3 seconds
    }
    $scope.addCrop = function () {
      //TODO: create a button for user to end up a crop
      $scope.newCrop.startdate = $("#startdate").val();
      $scope.newCrop.closedate = $("#closedate").val();
      var timeFormat = "MM/DD/YYYY HH:mm A";
      var newCrop = {
        DeviceMac: $scope.newCrop.DeviceMac,
        status: 'pending',
        name: $scope.newCrop.name,
        treetype: $scope.newCrop.treetype,
        type: $scope.newCrop.type,
        reporttime: $scope.newCrop.reporttime,
        synchronized: $scope.newCrop.synchronized,
        startdate: $scope.newCrop.startdate,
        closedate: $scope.newCrop.closedate
      }
      if (moment(newCrop.closedate, timeFormat) < moment(newCrop.startdate, timeFormat)) {
        flash.error = "Close date must be after start date !";
        // } else if (newCrop.startdate < new Date()) {
        //   flash.error = "Start date cannot before now";
        console.log(newCrop)
      } else {
        $('#addCropModal').modal('hide');

        if (moment(newCrop.startdate, timeFormat) > moment(new Date(), timeFormat)) {
          newCrop.status = 'pending';
        } else {
          newCrop.status = 'running';
        }

        CropService.addCrop(newCrop).then(function (result) {
          if (result.data.success) {
            bootbox.alert(result.data.message, function () {
              $state.reload();
            });
          }
          else {
            bootbox.alert(result.data.message);
          }

        })

      }
    }
    /* delete crop */
    $scope.deleteCrop = function (index, cropId, status) {
      bootbox.confirm("Do you want to delete this crop ?", function (result) {
        if (result) {
          var crop = {
            id: cropId
          }
          CropService.deleteCrop(crop).then(function (result) {
            if (result.data.success) {
              $scope.cropList.splice(index, 1);
              flash.success = result.data.message;
            } else {
              flash.error = result.data.message;
            }

          })
        }
      })
    }

    /* update share status */
    $scope.share = function (cropId, newShare, index) {
      var crop = {
        id: cropId,
        share: newShare
      }
      CropService.updateShareStatus(crop).then(function (result) {
        if (result.data.success) {
          $scope.cropList[index].share = newShare;
          flash.success = result.data.message;
        } else {
          flash.error = result.data.message;
        }
      })
    }

    /* rating crop */

    $scope.rate = 1;
    $scope.onItemRating = function (cropId, rating) {
      //TODO: implement this if u want to rate crop
      console.log(cropId + " " + rating);
    }
  })
  .directive('tooltip', function () {
    return {
      restrict: 'A',
      link: function (scope, element, attrs) {
        $(element).hover(function () {
          // on mouseenter
          $(element).tooltip('show');
        }, function () {
          // on mouseleave
          $(element).tooltip('hide');
        });
      }
    };
  });

controller.controller('CropDetailCtrl', function ($scope, $stateParams, $state, CropService, ScheduleService, flash) {

  $scope.dataTableOpt = {
    //custom datatable options
    // or load data through ajax call also
    "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50, 'All']],
  };

  $scope.dataScheduleTableOpt = {
    //custom datatable options
    // or load data through ajax call also
    "aLengthMenu": [[-1, 10, 20, 30, 50], ['All', 10, 20, 30, 50]],
  };

  $scope.mac = $stateParams.devicemac;
  $scope.cropid = $stateParams.cropid;
  $scope.currentCrop = {
    DeviceMac: $stateParams.devicemac,
    id: $stateParams.cropid,
  }

  CropService.getCropById($stateParams.cropid).then(function (result) {

    if (result.data.success) {
      $scope.crop = result.data.data;

      $scope.currentCrop.name = $scope.crop.name;
      $scope.currentCrop.treetype = $scope.crop.treetype;
      $scope.currentCrop.startdate = moment($scope.crop.startdate).format("MM/DD/YYYY HH:mm A");
      $scope.currentCrop.closedate = moment($scope.crop.closedate).format("MM/DD/YYYY HH:mm A");
      $scope.currentCrop.reporttime = $scope.crop.reporttime;
      $scope.currentCrop.type = $scope.crop.type;
    } else {
      flash.error = result.data.message;
    }

  })

  $scope.editCrop = function () {
    var editStartDate = $('#edit-startdate').val();
    var editCloseDate = $('#edit-closedate').val();
    var timeFormat = "MM/DD/YYYY HH:mm A";

    if (moment(editCloseDate, timeFormat) < moment(editStartDate, timeFormat)) {
      flash.error = "Close date must after start date!"
    } else {
      $('#editCropModal').modal('hide');
      var newEditCrop = {
        id: $scope.currentCrop.id,
        DeviceMac: $scope.currentCrop.DeviceMac,
        name: $scope.currentCrop.name,
        treetype: $scope.currentCrop.treetype,
        type: $scope.currentCrop.type,
        reporttime: $scope.currentCrop.reporttime,
        startdate: editStartDate,
        closedate: editCloseDate
      }
      CropService.editCrop(newEditCrop).then(function (result) {
        $scope.editSuccess = result.data.success;
        $scope.editMessage = result.data.message;
        if (result.data.success) {
          bootbox.alert(result.data.message, function () {
            $state.reload();
          })
        } else {
          flash.error = result.data.message;
        }
      }).catch(function (err) {
        flash.error = "Cannot update info"
        console.log(err);
      })
    }

  }

  $scope.exportSettingFile = function () {
    ScheduleService.exportToSettingFile($scope.cropid).then(function (res) {
      console.log(res.data)
    })
  }

  $scope.importSettingFile = function () {
    console.log("imported")
  }
})


controller.controller('CropDetailSearchCtrl', function ($scope, $stateParams, $state, CropService, ScheduleService, flash) {

  $scope.dataTableOpt = {
    //custom datatable options
    // or load data through ajax call also
    "aLengthMenu": [[10, 20, 30, 50, -1], [10, 20, 30, 50, 'All']],
  };

  $scope.dataScheduleTableOpt = {
    //custom datatable options
    // or load data through ajax call also
    "aLengthMenu": [[-1, 10, 20, 30, 50], ['All', 10, 20, 30, 50]],
  };

  $scope.mac = $stateParams.devicemac;
  $scope.cropid = $stateParams.cropid;

  CropService.getSearchCropById($stateParams.cropid).then(function (result) {

    if (result.data.success) {
      $scope.crop = result.data.data;
    } else {
      flash.error = result.data.message;
      $state.go('404');
    }
  })
})

controller.controller('CropReviewCtrl', function ($scope, $stateParams, $state, CropService, PagerService, flash) {
  var vm = this;
  CropService.getAllReviews($stateParams.cropid).then(function (result) {
    vm.allReviews = result.data.data;
    //vm.dummyItems = _.range(1, 151); // dummy array of items to be paged
    vm.pager = {};
    vm.setPage = setPage;

    initController();
    var sum = 0;
    for (i = 0; i < result.data.data.length; i++) {
      sum += result.data.data[i].rating;
    }
    vm.ratingPoint = Math.round((sum / result.data.data.length) * 100) / 100;
  })


  function initController() {
    // initialize to page 1
    vm.setPage(1);
  }

  function setPage(page) {
    if (page < 1 || page > vm.pager.totalPages) {
      return;
    }

    // get pager object from service
    vm.pager = PagerService.GetPager(vm.allReviews.length, page);

    // get current page of items
    vm.reviews = vm.allReviews.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
  }


  $scope.sendNewReview = function () {
    var review = {
      content: $scope.review.comment,
      rating: parseInt($('#newRatingPoint input:checked').val()),
      CropId: parseInt($stateParams.cropid)
    }
    CropService.sendNewReview(review).then(function (result) {
      if (result.data.success) {
        bootbox.alert(result.data.message, function () {
          $state.reload();
        });
      }
      else {
        flash.error = result.data.message;
      }
    })
  }

})
