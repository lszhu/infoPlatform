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
            }).when('/message/news', {
                templateUrl: 'messageView/news.html',
                controller: 'NewsCtrl'
            });
    }])

    .controller('EmployerCtrl', ['$scope', '$http', 'identify',
        function($scope, $http, identify) {

            $scope.postMsg = function() {
                var params = {
                    collect: 'organization',
                    name: $scope.name,
                    code: $scope.code
                };
                identify.check(params, postMsg);
            };

            // 信息上传函数
            function postMsg() {
                var employer = {
                    name: $scope.name,
                    code: $scope.code,
                    districtId: $scope.districtId,
                    phone: $scope.phone,
                    contact: $scope.contact,
                    address: $scope.address,
                    position: $scope.position,
                    description: $scope.description,
                    education: $scope.education,
                    salary: $scope.salary
                };
                $http.post('/postEmployer', {employer: employer})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            alert('您成功发布了企业招聘信息！');
                            clearMsg();
                        } else {
                            alert('信息发布失败，原因是：' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('信息发布失败，原因是：' + err);
                    });
            }

            // 控制提交按钮的可用性
            $scope.postDisabled = function() {
                var name = $scope.name;
                var code = $scope.code;
                var phone = $scope.phone;
                return !name  || !code || !phone;
            };

            // 改变列表显示的行政区域
            $scope.changeDistrict = function(newId) {
                if (!newId) {
                    return;
                }
                var tmpId = $scope.tmpDistrictId;
                if (newId == '..') {
                    if (tmpId.length > 6) {
                        $scope.tmpDistrictId = tmpId.slice(0, -2);
                    }
                } else if (4 < newId.length && newId.length < 10) {
                    $scope.tmpDistrictId = newId;
                }
                tmpId = $scope.tmpDistrictId.slice(0, -2);
                $scope.tmpDistrictName = $scope
                    .districts[tmpId][$scope.tmpDistrictId];
            };

            // 设置当前行政区域
            $scope.setDistrict = function(districtId) {
                $scope.districtId = districtId;
                var tmpId = districtId.slice(0, -2);
                $scope.districtName = $scope.districts[tmpId][districtId];
            };

            // 清除部分表单已填入的信息
            function clearMsg() {
                //$scope.name = '';
                //$scope.code = '';
                //$scope.phone = '';
                //$scope.contact = '';
                $scope.position = '';
                $scope.description = '';
                $scope.education = '';
                $scope.salary = '';
            }
    }])

    .controller('EmployeeCtrl', ['$scope', '$http', 'identify',
        function($scope, $http, identify) {
            $scope.postMsg = function() {
                var params = {
                    collect: 'person',
                    resident: $scope.resident,
                    name: $scope.name,
                    code: $scope.idNumber
                };
                if ($scope.resident == 'no') {
                    if (!confirm('您确实是外地户口吗？')) {
                        return;
                    }
                }
                identify.check(params, postMsg);
            };

            // 信息上传函数
            function postMsg() {
                var employee = {
                    name: $scope.name,
                    idNumber: $scope.idNumber,
                    districtId: $scope.districtId,
                    resident: $scope.resident,
                    phone: $scope.phone,
                    contact: $scope.contact,
                    education: $scope.education,
                    seniority: $scope.seniority,
                    experience: $scope.experience,
                    position: $scope.position,
                    salary: $scope.salary
                };
                console.log('districtId: ' + $scope.districtId);
                $http.post('/postEmployee', {employee: employee})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            alert('您成功发布了个人求职信息！');
                            clearMsg();
                        } else {
                            alert('信息发布失败，原因是：' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('信息发布失败，原因是：' + err);
                    });
            }


            // 验证身份证号的合法性（函数）
            var validIdNumber = identify.validIdNumber;

            // 检测输入的身份证信息
            $scope.checkIdNumber = function() {
                if (!validIdNumber($scope.idNumber)) {
                    alert('身份证输入有无，请重新输入');
                }
            };

            // 控制提交按钮的可用性
            $scope.postDisabled = function() {
                var name = $scope.name;
                var idNumber = $scope.idNumber;
                var districtId = $scope.districtId;
                var phone = $scope.phone;
                return !name || !idNumber || !validIdNumber(idNumber) ||
                    !districtId || !phone;
            };

            $scope.resident = 'yes';
            $scope.districtName = '';
            $scope.districtId = '';
            // 改变列表显示的行政区域
            $scope.changeDistrict = function(newId) {
                if (!newId) {
                    return;
                }
                var tmpId = $scope.tmpDistrictId;
                if (newId == '..') {
                    if (tmpId.length > 6) {
                        $scope.tmpDistrictId = tmpId.slice(0, -2);
                    }
                } else if (4 < newId.length && newId.length < 10) {
                    $scope.tmpDistrictId = newId;
                }
                tmpId = $scope.tmpDistrictId.slice(0, -2);
                $scope.tmpDistrictName = $scope
                    .districts[tmpId][$scope.tmpDistrictId];
            };

            // 设置当前行政区域
            $scope.setDistrict = function(districtId) {
                $scope.districtId = districtId;
                var tmpId = districtId.slice(0, -2);
                $scope.districtName = $scope.districts[tmpId][districtId];
            };

            // 清除部分表单已填入的信息
            function clearMsg() {
                $scope.districtName = '';
                $scope.districtId = '';
                $scope.name = '';
                $scope.idNumber = '';
                $scope.phone = '';
                $scope.contact = '';
                $scope.education = '';
                $scope.seniority = '';
                $scope.experience = '';
                $scope.position = '';
                $scope.salary = '';
            }

    }])

    .controller('PolicyCtrl', ['$scope', '$http', '$sce', 'formatInfo',
        'pagination', 'management', 'filterFilter',
        function($scope, $http, $sce, formatInfo,
                 pagination, management, filterFilter) {

            // 初始化页面参数
            $scope.page = pagination({y: 350, limit: 20,
                target: '/getNewsMsg'});
            // 设置查询条件为仅限政策法规
            $scope.page.params.condition  = {type: 'policy'};

            // 初始化管理操作
            $scope.manage = management({removeUrl: '/users/removePolicy'});

            // 初始化显示第一页
            $scope.page.queryItems(1);

            // 获取单位介绍信息
            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.post('/getNewsMsg', {infoId: infoId})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.list[0]);
                            $scope.information.content =
                                $sce.trustAsHtml($scope.information.content);
                        } else {
                            console.log(res.message);
                        }
                    })
                    .error(function(err) {
                        console.log('出现异常，无法查询到相关信息\n%o', err);
                    });
            };

            $scope.formatDate = function(date) {
                return !date ? '未知' : date.toString().split('T')[0];
            };

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

            // 获取指定页面的数据，同时清空删除列表及状态
            $scope.queryItems = function(p) {
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

        }])

    .controller('NewsCtrl', ['$scope', '$http', '$sce', 'formatInfo',
        'pagination', 'management', 'filterFilter',
        function($scope, $http, $sce, formatInfo,
                 pagination, management, filterFilter) {

            // 初始化页面参数
            $scope.page = pagination({limit: 20, target: '/getNewsMsg'});

            // 用于初始化列表信息
            $scope.page.queryItems(1);
            // 初始化管理操作
            $scope.manage = management({removeUrl: '/users/removeNews'});

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

            $scope.formatDate = function(date) {
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

            // 获取介绍信息
            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.post('/getNewsMsg', {infoId: infoId})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.list[0]);
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

    }]);