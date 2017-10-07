controller.controller('SearchCtrl', function ($scope, $state, SearchService) {
    $scope.searchData = {
        type: 'tree'
    };

    $scope.search = function () {
        $state.go('search_result', {'data': $scope.searchData.data, 'type': $scope.searchData.type})
    }
})

controller.controller('SearchResultCtrl', function ($scope, $stateParams, StandardStringService, SearchService, flash) {

    var searchData= {
        data: StandardStringService.standardizeString($stateParams.data),
        type: $stateParams.type
    }
    SearchService.search(searchData).then(function (result) {
        $scope.searchResult = result.data.data;
        if ($scope.searchResult.length > 0){
            flash.success = 'Search success !';
        } else {
            flash.error = 'No result !';
        }
    })
})