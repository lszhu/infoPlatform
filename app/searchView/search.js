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

    .controller('JobCtrl', ['$scope', '$http', '$sce', 'job', 'page',
        'formatInfo', function($scope, $http, $sce, job, page, formatInfo) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            //$scope.pageOption = page;
            // 用于获取数据
            $scope.jobs = job($scope.districtId);
            // 查询条件
            $scope.job = {};

            // 用于初始化列表信息
            //$scope.$watchCollection(
            //    'jobs.list',
            //    function(nValue) {
            //        if (!nValue || !nValue.length) {
            //            return;
            //        }
            //        // 初始化显示页面相关参数，依次为
            //        // 可用于分页显示的所以原始数据
            //        // 每页的显示数目，页码导航条显示的页码数
            //        // 设置翻页时自动滚屏到x/y坐标，例如(0, 450)
            //        $scope.pageOption = $scope
            //            .pageOption(nValue, limit, pageNav, x, y);
            //    }
            //);

            $scope.queryJob = function() {
                console.log('districtId: ' + $scope.districtId);
                $scope.job.districtId = $scope.districtId;
                //console.log($scope.job);
                $http.post('/searchJob', $scope.job)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.jobList, limit, pageNav, x, y);
                        }
                        console.log(res.jobList);
                    })
                    .error(function(err) {
                        console.log('无法获取招聘信息，错误原因：%o', err);
                    });
            };
            // 用于初始化列表信息
            $scope.queryJob();

            // 获取单位介绍信息
            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.get('/searchInformation/' + infoId)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.info);
                            $scope.information.content =
                                $sce.trustAsHtml($scope.information.content);
                        } else {
                            console.log('没有相关单位的信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        console.log('因出现异常，无法查询到相关信息\n' + err);
                    });
            };

            $scope.parseSalary = function(salary) {
                if (salary) {
                    return salary;
                } else {
                    return '面议';
                }
            };

            $scope.getDate = function(date) {
                //var d = new Date(date);
                //if (d == 'Invalid Date') {
                //    return '';
                //}
                //var ref = '';
                //ref += d.getFullYear() + '-';
                //ref += d.getMonth() + 1;
                //ref += '-' + d.getDate();
                //return ref;
                return !date ? '未知' : date.toString().split('T')[0];
            };
        }
    ])

    .controller('EnterpriseCtrl', ['$scope', '$http', '$sce', 'page',
        'formatInfo', function($scope, $http, $sce, page, formatInfo) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息
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

            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.get('/searchInformation/' + infoId)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.info);
                            //$scope.information = res.info;
                            $scope.information.content =
                                $sce.trustAsHtml($scope.information.content);
                            //$scope.information.heading = res.info.name;
                            //$scope.information.reference =
                            //    makeReference(res.info);
                            //console.log('heading: %o', res.info.name);
                        } else {
                            console.log('没有相关单位的信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        console.log('因出现异常，无法查询到相关信息\n' + err);
                    });
            };

            //function makeReference(info) {
            //    var ref = '';
            //    if (info.hasOwnProperty('date')) {
            //        var d = new Date(info.date);
            //        ref += '发布日期：';
            //        ref += d.getFullYear() + '-';
            //        ref += d.getMonth() + 1;
            //        ref += '-' + d.getDate();
            //    }
            //    if (info.hasOwnProperty('source')) {
            //        ref += info.source;
            //    }
            //    return ref;
            //}
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

            $scope.getDate = function(date) {
                //var d = new Date(date);
                //if (d == 'Invalid Date') {
                //    return '';
                //}
                //var ref = '';
                //ref += d.getFullYear() + '-';
                //ref += d.getMonth() + 1;
                //ref += '-' + d.getDate();
                //return ref;
                return !date ? '未知' : date.toString().split('T')[0];
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