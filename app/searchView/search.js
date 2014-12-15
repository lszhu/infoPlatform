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

    .controller('JobCtrl', ['$scope', '$http', '$window', 'job', 'page',
        function($scope, $http, $window, job, page) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            $scope.pageOption = page;
            // 用于获取数据
            $scope.jobs = job($scope.districtId);
            // 查询条件
            $scope.job = {};

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
                        .pageOption(nValue, limit, pageNav, x, y);
                }
            );

            $scope.queryJob = function() {
                console.log('districtId: ' + $scope.districtId);
                $scope.job.districtId = $scope.districtId;
                console.log($scope.job);
                $http.post('/searchJob', $scope.job)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            var tmp = res.jobList;
                            tmp.sort(function(a, b) {
                                if (a.date == b.date) {
                                    return 0;
                                } else {
                                    return a.date < b.date ? 1 : -1;
                                }
                            });
                            $scope.pageOption =
                                page(tmp, limit, pageNav, x, y);
                        }
                    })
                    .error(function(err) {
                        console.log('无法获取招聘信息，错误原因：%o', err);
                    });
            };

            $scope.parseSalary = function(salary) {
                if (salary) {
                    return salary;
                } else {
                    return '面议';
                }
            };
        }
    ])

    .controller('EnterpriseCtrl', ['$scope', '$http', 'page',
        function($scope, $http, page) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            $scope.pageOption = {};
            // 查询条件
            $scope.org = {};


            $scope.searchOrganization = function () {
                $scope.org.districtId = $scope.districtId;
                console.log($scope.org);
                $http.post('/searchOrganization', $scope.org)
                    .success(function (res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.list, limit, pageNav, x, y);
                            console.log('org info length: ' + res.list.length);
                        } else {
                            alert('未查询到任何求职信息\n' + res.message);
                        }
                    })
                    .error(function (err) {
                        alert('因出现异常，无法正确查询到相关信息\n' + err);
                    });
            };
        }
    ])

    .controller('ManpowerCtrl', ['$scope', '$http', 'page',
        function($scope, $http, page) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            $scope.pageOption = {};
            // 查询条件
            $scope.manpower = {};


            $scope.searchManpower = function() {
                $scope.manpower.districtId = $scope.districtId;
                console.log('manpower condition: %o', $scope.manpower);
                $http.post('/searchManpower', $scope.manpower)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.list, limit, pageNav, x, y);
                        } else {
                            alert('未查询到任何求职信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('因出现异常，无法正确查询到相关信息\n' + err);
                    });
            };

        }
    ])

    .controller('WorkerCtrl', ['$scope', '$http', 'page',
        function($scope, $http, page) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            $scope.pageOption = {};
            // 查询条件
            $scope.worker = {};

            $scope.searchWorker = function() {
                $scope.worker.districtId = $scope.districtId;
                console.log('manpower condition: %o', $scope.worker);
                $http.post('/searchWorker', $scope.worker)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.list, limit, pageNav, x, y);
                        } else {
                            alert('未查询到任何求职信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('因出现异常，无法正确查询到相关信息\n' + err);
                    });
            };
        }
    ]);