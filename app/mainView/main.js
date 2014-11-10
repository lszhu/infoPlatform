'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/main/view1', {
                templateUrl: 'mainView/view1.html',
                controller: 'View1Ctrl'
            })
            .when('/main/home', {
                templateUrl: 'mainView/home.html',
                controller: 'View1Ctrl'
            });
    }])

    .controller('View1Ctrl', [function() {

    }]);