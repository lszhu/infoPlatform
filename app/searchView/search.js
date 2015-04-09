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

    // 单位招聘信息查询
    .controller('JobCtrl', ['$scope', '$http', '$sce', 'management',
        'pagination', 'formatInfo', 'filterFilter',
        function($scope, $http, $sce, management,
                 pagination, formatInfo, filterFilter) {
            // 初始化页面参数
            $scope.page = pagination({y: 450, limit: 50,
                target: '/searchJob'});
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

            // 将时间范围初始化为最近半年范围
            function initDateInterval(ref) {
                var t = new Date();
                var y = t.getFullYear();
                var m = t.getMonth() + 1;
                var d = t.getDate();
                ref.dateTo = y + '-' + (m < 10 ? '0' + m : m) + '-' +
                (d < 10 ? '0' + d : d);

                t = new Date(y, m - 7, d);
                y = t.getFullYear();
                m = t.getMonth() + 1;
                ref.dateFrom = y + '-' + (m < 10 ? '0' + m : m) + '-' +
                (d < 10 ? '0' + d : d);
            }
            initDateInterval($scope.job);

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

    // 处理企业单位信息查询
    .controller('EnterpriseCtrl', ['$scope', '$http', '$sce',
        'pagination', 'management', 'formatInfo', 'identify',
        function($scope, $http, $sce, pagination,
                 management, formatInfo, identify) {
            // 初始化页面参数
            $scope.page = pagination({y: 450, limit: 50,
                target: '/searchOrganization'});
            // 清空缓存数据
            $scope.page.params.itemList = [];
            $scope.page.params.pageList = [];
            // 关联查询条件
            $scope.org = $scope.page.params.condition;
            // 初始化查询参数中的区域选择参数districtId
            $scope.org.districtId = $scope.districtId;
            // 利用其管理功能，但不支持修改
            $scope.manage = management();

            // 在本地记录用户是否通过身份验证，已不再使用
            var customerIdentified = false;
            // 用于记录用于验证的个人姓名与身份证号
            $scope.person = {};

            // 验证身份后，获取指定页面的数据，已不再使用
            $scope.queryItems = function(page) {
                var p = 0 < page ? page : 1;
                var register = $scope.manage.params.register;
                if (register && register != 'anonymous') {
                    customerIdentified = true;
                }
                if (customerIdentified) {
                    $scope.page.queryItems(p);
                    return;
                }
                $('#customerChecker').modal('show');
            };

            // 用于验证查询者身份，已不再使用
            $scope.checkCustomer = function() {
                var params = {
                    collect: 'person',
                    name: $scope.person.name,
                    code: $scope.person.code
                };
                identify.check(params, function() {
                    // 验证成功后执行以下指令
                    customerIdentified = true;
                    $scope.queryItems(1);
                });
            };

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

    // 个人求职信息查询
    .controller('ManpowerCtrl', ['$scope', '$http', 'filterFilter',
        'pagination', 'management', 'identify',
        function($scope, $http, filterFilter,
                 pagination, management, identify) {

            // 在本地记录用户是否通过身份验证
            var customerIdentified = false;
            // 用于记录用于验证的单位名和组织机构代码
            $scope.org = {};
            // 初始化页面参数
            $scope.page = pagination({y: 450, limit: 50,
                target: '/searchManpower'});
            // 关联查询条件
            $scope.manpower = $scope.page.params.condition;
            // 初始化查询参数中的区域选择参数districtId
            $scope.manpower.districtId = $scope.districtId;

            // 将时间范围初始化为最近半年范围
            function initDateInterval(ref) {
                var t = new Date();
                var y = t.getFullYear();
                var m = t.getMonth() + 1;
                var d = t.getDate();
                ref.dateTo = y + '-' + (m < 10 ? '0' + m : m) + '-' +
                    (d < 10 ? '0' + d : d);

                t = new Date(y, m - 7, d);
                y = t.getFullYear();
                m = t.getMonth() + 1;
                ref.dateFrom = y + '-' + (m < 10 ? '0' + m : m) + '-' +
                    (d < 10 ? '0' + d : d);
            }
            initDateInterval($scope.manpower);

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
            $scope.queryItems = function(page) {
                var p = 0 < page ? page : 1;
                var register = $scope.manage.params.register;
                if (register && register != 'anonymous') {
                    customerIdentified = true;
                }
                if (customerIdentified) {
                    // 控制表格的显示
                    $scope.showTable = true;
                    // 清除快速过滤关键字
                    $scope.quickFilter = '';
                    $scope.manage.params.removalList = [];
                    $scope.manage.params.selectedAll = false;
                    $scope.page.queryItems(p);
                    return;
                }
                $('#customerChecker').modal('show');
            };

            $scope.checkCustomer = function() {
                var params = {
                    collect: 'organization',
                    name: $scope.org.name,
                    code: $scope.org.code
                };
                identify.check(params, function() {
                    // 验证成功后执行以下指令
                    customerIdentified = true;
                    $scope.queryItems(1);
                });
            };

            // 获取指定页面的数据，同时清空删除列表及状态
            //function queryItems(p) {
            //    // 控制表格的显示
            //    $scope.showTable = true;
            //    // 清除快速过滤关键字
            //    $scope.quickFilter = '';
            //    $scope.manage.params.removalList = [];
            //    $scope.manage.params.selectedAll = false;
            //    $scope.page.queryItems(p);
            //}

            // 删除选中数据项
            $scope.removeItems = function(p) {
                $scope.manage.removeItems(p, $scope.page.params.itemList,
                    $scope.page.params.itemListRaw);
            };

        }
    ])

    // 劳动力资源信息查询
    .controller('WorkerCtrl', ['$scope', '$http', 'pagination', 'management',
        'identify', function($scope, $http, pagination, management, identify) {
            // 初始化页面参数
            $scope.page = pagination({y: 450, limit: 50,
                target: '/searchWorker'});
            // 清空缓存数据
            $scope.page.params.itemList = [];
            $scope.page.params.pageList = [];
            // 关联查询条件
            $scope.worker = $scope.page.params.condition;
            // 初始化查询参数中的区域选择参数districtId
            $scope.worker.districtId = $scope.districtId;
            // 利用其管理功能，但不支持修改
            $scope.manage = management();

            // 在本地记录用户是否通过身份验证
            var customerIdentified = false;
            // 用于记录用于验证的单位名和组织机构代码
            $scope.org = {};

            // 获取指定页面的数据，同时清空删除列表及状态
            $scope.queryItems = function(page) {
                var p = 0 < page ? page : 1;
                var register = $scope.manage.params.register;
                if (register && register != 'anonymous') {
                    customerIdentified = true;
                }
                if (customerIdentified) {
                    $scope.page.queryItems(p);
                    return;
                }
                $('#customerChecker').modal('show');
            };

            $scope.checkCustomer = function() {
                var params = {
                    collect: 'organization',
                    name: $scope.org.name,
                    code: $scope.org.code
                };
                identify.check(params, function() {
                    // 验证成功后执行以下指令
                    customerIdentified = true;
                    $scope.queryItems(1);
                });
            };

            // 跟踪区域选择参数districtId
            $scope.$watch('districtId', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.worker.districtId = newValue;
            });
        }
    ]);