'use strict';

angular.module('myApp.search', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/search/job', {
                templateUrl: 'searchView/job.html',
                controller: 'JobCtrl'
            })
            .when('/search/manpower', {
                templateUrl: 'searchView/manpower.html',
                controller: 'ManpowerCtrl'
            })
            .when('/search/worker', {
                templateUrl: 'searchView/worker.html',
                controller: 'SearchCtrl'
            })
            .when('/search/enterprise', {
                templateUrl: 'searchView/enterprise.html',
                controller: 'SearchCtrl'
            });
    }])

    .controller('JobCtrl', ['$scope', 'job', function($scope, job) {
        $scope.jobs = job;
    }])

    .controller('ManpowerCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.manpowerList = [];
        $scope.searchManpower = function() {
            $http.post('./searchManpower', $scope.manpower)
                .success(function(res) {
                    if (res.status == 'ok') {
                        $scope.manpowerList = res.list;
                    } else {
                        alert('未查询到任何求职信息\n' + res.message);
                    }
                })
                .error(function(err) {
                    alert('因出现异常，无法正确查询到相关信息\n' + err);
                });
        };

        $scope.getContact = function(person) {
            if(!person || !person.idNumber) {
                return ''
            }
            var phone = person.phone;
            var contact = person.contact;
            if (phone && contact) {
                return phone + '或 ' + contact;
            } else {
                return phone + contact;
            }
        };

        $scope.getSex = function(person) {
            if(!person || !person.idNumber) {
                return ''
            }
            var id = person.idNumber.toString().slice(16, 17);
            if(!id) {
                return '';
            }
            return id % 2 == 0 ? '女' : '男';
        };

        $scope.getAge = function(person) {
            if(!person || !person.idNumber) {
                return ''
            }
            var birth = person.idNumber.toString().slice(6, 10);
            if(!birth || birth.length != 4) {
                return '';
            }
            return (new Date()).getFullYear() - birth;
        }

    }])
    .controller('SearchCtrl', [function() {

    }]);