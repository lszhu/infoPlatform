'use strict';

angular.module('myApp.etc', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/etc/about', {
                templateUrl: 'etcView/about.html',
                controller: 'EtcCtrl'
            }).when('/etc/clause', {
                templateUrl: 'etcView/clause.html',
                controller: 'EtcCtrl'
            }).when('/etc/help', {
                templateUrl: 'etcView/help.html',
                controller: 'EtcCtrl'
            }).when('/etc/introduction', {
                templateUrl: 'etcView/introduction.html',
                controller: 'EtcCtrl'
            }).when('/etc/login', {
                templateUrl: 'etcView/login.html',
                controller: 'EtcCtrl'
            }).when('/etc/suggestion', {
                templateUrl: 'etcView/suggestion.html',
                controller: 'EtcCtrl'
            });
    }])

    .controller('EtcCtrl', ['$scope', '$http', '$document',
        function($scope, $http, $document) {
            $scope.showContents = function() {
                //console.log($window);
                var c = $document.find('.note-editable').html();
                console.log(c);
            }
        }
    ]);