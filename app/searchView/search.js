'use strict';

angular.module('myApp.search', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/search/job', {
                templateUrl: 'searchView/job.html',
                controller: 'JobCtrl'
            })
            .when('/search/enterprise', {
                templateUrl: 'searchView/enterprise.html',
                controller: 'EnterpriseCtrl'
            })
            .when('/search/manpower', {
                templateUrl: 'searchView/manpower.html',
                controller: 'ManpowerCtrl'
            })
            .when('/search/worker', {
                templateUrl: 'searchView/worker.html',
                controller: 'WorkerCtrl'
            });
    }])

    .controller('JobCtrl', ['$scope', 'job', function($scope, job) {
        $scope.jobs = job;
    }])

    .controller('EnterpriseCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.orgList = [];
        var limit = 1000;
        // 总页面数
        var page = 0;
        // 当前页面编号
        var curPage = 1;

        $scope.searchOrganization = function () {
            $http.post('/searchOrganization', $scope.manpower)
                .success(function (res) {
                    if (res.status == 'ok') {
                        $scope.orgList = res.list;
                        $scope.orgs = $scope.orgList.slice(0, limit);
                        console.log('org info length: ' + $scope.orgs.length);
                    } else {
                        alert('未查询到任何求职信息\n' + res.message);
                    }
                })
                .error(function (err) {
                    alert('因出现异常，无法正确查询到相关信息\n' + err);
                });
        };
    }])

    .controller('ManpowerCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.manpowerList = [];
        $scope.searchManpower = function() {
            $http.post('/searchManpower', $scope.manpower)
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

    }])

    .controller('WorkerCtrl', ['$scope', '$http', function($scope, $http) {
        $scope.workerList = [];
        // 每页面显示条目数
        var limit = 1000;
        // 总页面数
        var page = 0;

        $scope.searchWorker = function() {
            $http.post('/searchWorker', $scope.worker)
                .success(function(res) {
                    if (res.status == 'ok') {
                        $scope.workerList = res.list;
                        $scope.workers = $scope.workerList.slice(0, limit);
                        page = $scope.workerList.length / limit;
                        console.log($scope.workerList.length);
                    } else {
                        alert('未查询到任何求职信息\n' + res.message);
                    }
                })
                .error(function(err) {
                    alert('因出现异常，无法正确查询到相关信息\n' + err);
                });
        };

    }]);