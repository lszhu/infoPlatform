'use strict';

angular.module('myApp.message', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/message/employer', {
                templateUrl: 'messageView/employer.html',
                controller: 'EnterpriseCtrl'
            })
            .when('/message/employee', {
                templateUrl: 'messageView/employee.html',
                controller: 'JobHunterCtrl'
            })
            .when('/message/policy', {
                templateUrl: 'messageView/policy.html',
                controller: 'PolicyCtrl'
            });
    }])

    .controller('EnterpriseCtrl', [function() {

    }])
    .controller('JobHunterCtrl', [function() {

    }])
    .controller('PolicyCtrl', [function() {

    }]);