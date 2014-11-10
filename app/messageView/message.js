'use strict';

angular.module('myApp.message', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/message/policy', {
                templateUrl: '/message/policy.html',
                controller: 'PolicyCtrl'
            });
    }])

    .controller('PolicyCtrl', [function() {

    }]);