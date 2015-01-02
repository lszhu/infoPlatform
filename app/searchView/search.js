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

    .controller('JobCtrl', ['$scope', '$http', '$sce', 'management',
        'pagination', 'formatInfo', 'filterFilter',
        function($scope, $http, $sce, management,
                 pagination, formatInfo, filterFilter) {
            // 初始化页面参数
            $scope.page = pagination({target: '/searchJob'});
            // 关联查询条件
            $scope.job = $scope.page.params.condition;
            // 初始化查询参数中的区域选择参数districtId
            $scope.job.districtId = $scope.districtId;

            // 跟踪区域选择参数districtId
            $scope.$watch('districtId', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.job.districtId = newValue;
            });

            // 用于初始化列表信息
            $scope.page.queryItems(1);
            // 初始化管理操作
            $scope.manage = management({removeUrl: '/users/removeJob'});

            // 跟踪过滤关键字的变化
            $scope.$watch('quickFilter', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.page.params.itemList =
                    filterFilter($scope.page.params.itemListRaw, newValue);
                $scope.manage.params.removalList = [];
                $scope.manage.params.selectedAll = false;
            });

            $scope.getDate = function(date) {
                return !date ? '未知' : date.toString().split('T')[0];
            };

            // 获取指定页面的数据，同时清空删除列表及状态
            $scope.queryItems = function(p) {
                // 清除快速过滤关键字
                $scope.quickFilter = '';
                $scope.manage.params.removalList = [];
                $scope.manage.params.selectedAll = false;
                $scope.page.queryItems(p);
            };

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

            // 删除选中数据项
            $scope.removeItems = function(p) {
                $scope.manage.removeItems(p, $scope.page.params.itemList,
                    $scope.page.params.itemListRaw);
            };

        }
    ])

    .controller('EnterpriseCtrl', ['$scope', '$http', '$sce', '$window',
        'pagination', 'formatInfo',
        function($scope, $http, $sce, $window, pagination, formatInfo) {
            // 初始化页面参数
            $scope.page = pagination({target: '/searchOrganization'});
            // 关联查询条件
            $scope.org = $scope.page.params.condition;
            // 初始化查询参数中的区域选择参数districtId
            $scope.org.districtId = $scope.districtId;

            // 跟踪区域选择参数districtId
            $scope.$watch('districtId', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.org.districtId = newValue;
            });

            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.get('/searchInformation/' + infoId)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.info);
                            //$scope.information = res.info;
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
        }
    ])

    .controller('ManpowerCtrl', ['$scope', '$http', 'filterFilter',
        'pagination', 'management',
        function($scope, $http, filterFilter, pagination, management) {

            // 初始化页面参数
            $scope.page = pagination({target: '/searchManpower'});
            // 关联查询条件
            $scope.manpower = $scope.page.params.condition;
            // 初始化查询参数中的区域选择参数districtId
            $scope.manpower.districtId = $scope.districtId;

            // 跟踪区域选择参数districtId
            $scope.$watch('districtId', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.manpower.districtId = newValue;
            });

            $scope.manage = management({removeUrl: '/users/removeManpower'});
            // 跟踪过滤关键字的变化
            $scope.$watch('quickFilter', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.page.params.itemList =
                    filterFilter($scope.page.params.itemListRaw, newValue);
                $scope.manage.params.removalList = [];
                $scope.manage.params.selectedAll = false;
            });

            $scope.getDate = function(date) {
                return !date ? '未知' : date.toString().split('T')[0];
            };

            // 获取指定页面的数据，同时清空删除列表及状态
            $scope.queryItems = function(p) {
                // 控制表格的显示
                $scope.showTable = true;
                // 清除快速过滤关键字
                $scope.quickFilter = '';
                $scope.manage.params.removalList = [];
                $scope.manage.params.selectedAll = false;
                $scope.page.queryItems(p);
            };

            // 删除选中数据项
            $scope.removeItems = function(p) {
                $scope.manage.removeItems(p, $scope.page.params.itemList,
                    $scope.page.params.itemListRaw);
            };

        }
    ])

    .controller('WorkerCtrl', ['$scope', '$http', 'pagination',
        function($scope, $http, pagination) {
            // 初始化页面参数
            $scope.page = pagination({target: '/searchWorker'});
            // 关联查询条件
            $scope.worker = $scope.page.params.condition;
            // 初始化查询参数中的区域选择参数districtId
            $scope.worker.districtId = $scope.districtId;

            // 跟踪区域选择参数districtId
            $scope.$watch('districtId', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.worker.districtId = newValue;
            });
        }
    ]);