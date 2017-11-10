controller.controller('SearchCtrl', function ($scope, $state, SearchService) {
  $scope.searchData = {
  };
    $scope.search = function () {
        var searchData= {
            tree: $scope.searchData.treetype == null? '' : $scope.searchData.treetype,
            month: $('#monthinput').val() == NaN? -1 : moment($('#monthinput').val(),'MMMM').month() + 1,
            type: 'both'
        }
        if ($('#treetypeSelector').is(":checked") && $('#monthSelector').is(":checked"))
        {
          console.log(searchData);
          searchData.type = 'both';
          $state.go('search_result_byboth', {'tree': searchData.tree, 'month': searchData.month,'type': searchData.type})
        }
        else {
          if ($('#treetypeSelector').is(":checked"))
          {
            searchData.type = 'tree';
            $state.go('search_result_bytree', {'tree': searchData.tree, 'type': searchData.type})
          }
          else {
            if ($('#monthSelector').is(":checked"))
            {
              searchData.type = 'month';
              $state.go('search_result_bymonth', {'month': searchData.month, 'type': searchData.type})
            }
          }
        }
    }
})

controller.controller('SearchResultCtrl', function ($scope, $stateParams, StandardStringService, SearchService, flash) {
  var searchData = {
    type: $stateParams.type
  }
  if ($stateParams.type === 'tree')
  {
    searchData.tree = $stateParams.tree;
  }
  else {
    if ($stateParams.type === 'month')
    {
      searchData.month = $stateParams.month;
    }
    else {
      searchData.tree = $stateParams.tree;
      searchData.month = $stateParams.month;
    }
  }
    SearchService.search(searchData).then(function (result) {
      console.log(result);
        $scope.searchResult = result.data.data;
        $scope.searchData= {
          tree: searchData.tree,
          month: moment().month(searchData.month - 1).format('MMMM'),
          type: searchData.type
        }
        if (result.data.data.length > 0){
            flash.success = 'Search success !';
        } else {
            flash.error = 'No result !';
        }
    })
})
