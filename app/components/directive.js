'use strict';

angular.module('myApp.directive', [])

    .directive('alertMsg', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/etcView/clause.html'
        }
    });