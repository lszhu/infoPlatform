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

    .controller('EmployerCtrl', ['$scope', '$http', function($scope, $http) {
        // 信息上传函数
        $scope.postMsg = function() {
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
        };

        // 控制提交按钮的可用性
        $scope.postDisabled = function() {
            var name = $scope.name;
            var code = $scope.code;
            var phone = $scope.phone;
            return !name || !name.trim() || !code ||
                !code.trim() || !phone || !phone.trim();
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

    .controller('EmployeeCtrl', ['$scope', '$http', function($scope, $http) {
        // 信息上传函数
        $scope.postMsg = function() {
            var employee = {
                name: $scope.name,
                idNumber: $scope.idNumber,
                districtId: $scope.districtId,
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
        };

        // 检测输入的身份证信息
        $scope.checkIdNumber = function() {
            $scope.idNumber = $scope.idNumber.trim();
            if (!validIdNumber($scope.idNumber)) {
                alert('身份证输入有无，请重新输入');
            }
        };

        // 控制提交按钮的可用性
        $scope.postDisabled = function() {
            var name = $scope.name;
            var idNumber = $scope.idNumber;
            var phone = $scope.phone;
            return !name || !name.trim() || !idNumber || !idNumber.trim() ||
                !validIdNumber(idNumber.trim()) || !phone || !phone.trim();
        };

        // 清除部分表单已填入的信息
        function clearMsg() {
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

        // 验证身份证号的合法性
        function validIdNumber(idNumber) {
            if (idNumber.length != 18 || 12 < idNumber.slice(10, 12) ||
                idNumber.slice(6, 8) < 19 || 20 < idNumber.slice(6, 8)) {
                return false;
            }
            var weights = [
                '7', '9', '10', '5', '8', '4', '2', '1', '6',
                '3', '7', '9', '10', '5', '8', '4', '2', '1'
            ];
            var sum = 0;
            for (var i = 0; i < 17; i++) {
                var digit = idNumber.charAt(i);
                if (isNaN(Number(digit))) {
                    return false;
                }
                sum += digit * weights[i];
            }
            sum = (12 - sum % 11) % 11;
            return sum == 10 && idNumber.charAt(17).toLowerCase() == 'x' ||
                sum < 10 && sum == idNumber.charAt(17);
        }
    }])

    .controller('PolicyCtrl', ['$scope', '$http', '$sce', 'formatInfo',
        'pagination', 'management', 'filterFilter',
        function($scope, $http, $sce, formatInfo,
                 pagination, management, filterFilter) {

            // 初始化页面参数
            $scope.page = pagination({limit: 10, target: '/getPolicyMsg'});

            // 初始化管理操作
            $scope.manage = management({removeUrl: '/users/removePolicy'});

            // 初始化显示第一页
            $scope.page.queryItems(1);

            // 获取单位介绍信息
            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.post('/getPolicyMsg', {infoId: infoId})
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
        'page', function($scope, $http, $sce, formatInfo, page) {
            // 每页的显示数目
            var limit = 20;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 400;
            // 用于保存页面显示相关信息
            $scope.pageOption = {};

            $scope.formatDate = function(date) {
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

            $scope.queryNewsList = function() {
                var factor = {list: true, districtId: $scope.districtId};
                $http.post('/getNewsMsg', factor)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.newsList, limit, pageNav, x, y);
                        }
                        console.log(res.newsList);
                    })
                    .error(function(err) {
                        console.log('无法获取人力资源与就业服务政策信息，' +
                        '错误原因：%o', err);
                    });
            };
            // 用于初始化列表信息
            $scope.queryNewsList();

            // 获取新闻或政策信息具体内容（以时间戳为标准）
            // 通过参数news为'1'决定是新闻，否则是政策
            $scope.getMsg = function(date, news) {
                var infoId = new Date(date);
                console.log('NewsId: ' + date);
                var url = news ? '/getNewsMsg' : '/getPolicyMsg';
                $http.post(url, {infoId: infoId})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            var list = news ? 'newsList' : 'policyList';
                            $scope.information = formatInfo(res[list][0]);
                            $scope.information.content =
                                $sce.trustAsHtml($scope.information.content);
                        } else {
                            console.log('没有相关单位的信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        console.log('无法获取人力资源与就业服务政策信息，' +
                        '错误原因：%o', err);
                    });
            };
    }]);