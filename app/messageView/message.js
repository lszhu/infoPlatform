'use strict';

angular.module('myApp.message', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/message/employer', {
                templateUrl: 'messageView/employer.html',
                controller: 'EmployerCtrl'
            })
            .when('/message/employee', {
                templateUrl: 'messageView/employee.html',
                controller: 'EmployeeCtrl'
            })
            .when('/message/policy', {
                templateUrl: 'messageView/policy.html',
                controller: 'PolicyCtrl'
            });
    }])

    .controller('EmployerCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.postMsg = function() {
            $scope.employer = {
                name: $scope.name,
                code: $scope.code,
                phone: $scope.phone,
                contact: $scope.contact,
                position: $scope.position,
                description: $scope.description,
                education: $scope.education,
                salary: $scope.salary
            };
            $http.post('/postEmployer', $scope.employer)
                .success(function(res) {
                    if (res.status == 'ok') {
                        alert('您成功发布了企业招聘信息！');
                        clearMsg();
                    } else {
                        alert('信息发布失败，原因是：' + res.error);
                    }
                })
                .error(function(err) {
                    alert('信息发布失败，原因是：' + err);
                });
        };

        function clearMsg() {
            $scope.name = '';
            $scope.code = '';
            $scope.phone = '';
            $scope.contact = '';
            $scope.position = '';
            $scope.description = '';
            $scope.education = '';
            $scope.salary = '';
        }
    }])

    .controller('EmployeeCtrl', [function() {

    }])

    .controller('PolicyCtrl', [function() {

    }])

    .directive('alertMsg', function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/etcView/clause.html'
        }
    });