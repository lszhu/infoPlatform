'use strict';

angular.module('myApp.manage', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/manage/user', {
                templateUrl: 'manageView/user.html',
                controller: 'ManageCtrl'
            })
            .when('/manage/post', {
                templateUrl: 'manageView/post.html',
                controller: 'ManageCtrl'
            });
    }])

    .controller('ManageCtrl', [function() {

    }]);