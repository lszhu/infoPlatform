'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.home',
    'myApp.view2',
    'myApp.message',
    'myApp.search',
    'myApp.manage',
    'myApp.version'
]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/main/home'});
    }]);

angular.module('myApp')
    .controller('MainCtrl', ['$scope',
        function($scope) {

        }
    ]);