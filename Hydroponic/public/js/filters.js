var filter = angular.module('myApp.filter',[]);

filter.filter('unsafe',  ['$sce', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
}])