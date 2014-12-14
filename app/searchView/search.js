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

    .controller('JobCtrl', ['$scope', '$window', 'job', 'page',
        function($scope, $window, job, page) {
            // 用于监控获取数据
            $scope.jobs = job;
            // 用于滚动屏幕操作
            $scope.window = $window;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            $scope.pageOption = page;
            //$scope.page = page;

            // 用于初始化列表信息
            $scope.$watchCollection(
                'jobs.list',
                function(nValue) {
                    if (!nValue || !nValue.length) {
                        return;
                    }
                    // 初始化显示页面相关参数，依次为
                    // 可用于分页显示的所以原始数据
                    // 每页的显示数目，页码导航条显示的页码数
                    // 设置翻页时自动滚屏到x/y坐标，例如(0, 450)
                    $scope.pageOption = $scope
                        .pageOption(nValue, 20, 5, 0, 450);
                    // 设置翻页时自动滚屏到x/y坐标为(0, 450)
                    //$scope.pageSelect = function(n) {
                    //    $scope.pageOption.select(n, $scope.window, 0, 450);
                    //}
                }
            );

            $scope.parseSalary = function(salary) {
                if (salary) {
                    return salary;
                } else {
                    return '面议';
                }
            };
        }
    ])

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