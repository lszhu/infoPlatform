'use strict';

angular.module('myApp.search', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/search/worker', {
                templateUrl: 'searchView/worker.html',
                controller: 'SearchCtrl'
            })
            .when('/search/enterprise', {
                templateUrl: 'searchView/enterprise.html',
                controller: 'SearchCtrl'
            });
    }])

    .controller('SearchCtrl', [function() {

    }]);