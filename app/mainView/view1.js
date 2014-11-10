'use strict';

angular.module('myApp.view1', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/mainView/view1', {
                templateUrl: 'mainView/view1.html',
                controller: 'View1Ctrl'
            })
            .when('/mainView/home', {
                templateUrl: 'mainView/home.html',
                controller: 'View1Ctrl'
            });
    }])

    .controller('View1Ctrl', [function() {

    }]);