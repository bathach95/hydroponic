var factory = angular.module('myApp.factory',[]);


factory.factory('AuthInterceptor', function AuthInterceptor($cookies) {
  'use strict';
  return {
    request: addToken
  };

  function addToken(config) {
    var token = $cookies.get('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['token'] = token;
    }
    return config;
  }
});

factory.factory('PagerService', function PagerService() {
        // service definition
        var service = {};

        service.GetPager = GetPager;

        return service;

        // service implementation
        function GetPager(totalItems, currentPage, pageSize) {
            // default to first page
            currentPage = currentPage || 1;

            // default page size is 10
            pageSize = pageSize || 5;

            // calculate total pages
            var totalPages = Math.ceil(totalItems / pageSize);

            var startPage, endPage;
            if (totalPages <= 5) {
                // less than 10 total pages so show all
                startPage = 1;
                endPage = totalPages;
            } else {
                // more than 10 total pages so calculate start and end pages
                if (currentPage <= 3) {
                    startPage = 1;
                    endPage = 5;
                } else if (currentPage + 2 >= totalPages) {
                    startPage = totalPages - 4;
                    endPage = totalPages;
                } else {
                    startPage = currentPage - 3;
                    endPage = currentPage + 2;
                }
            }

            // calculate start and end item indexes
            var startIndex = (currentPage - 1) * pageSize;
            var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

            // create an array of pages to ng-repeat in the pager control
            var pages = [];
            for (i = startPage; i < endPage + 1; i++){
              pages.push(i);
            }
            //var pages = _.range(startPage, endPage + 1);

            // return object with all pager properties required by the view
            console.log("---");
            console.log(totalItems);
            console.log(currentPage);
            console.log(pages.length);
            console.log("---");
            return {
                totalItems: totalItems,
                currentPage: currentPage,
                pageSize: pageSize,
                totalPages: totalPages,
                startPage: startPage,
                endPage: endPage,
                startIndex: startIndex,
                endIndex: endIndex,
                pages: pages
            };
        }
    })
