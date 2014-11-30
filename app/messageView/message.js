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

    .controller('PolicyCtrl', ['$scope', '$http', '$document',
        function($scope, $http, $document) {
            // 用于测试
            $scope.policies = [
                {
                    content: '人力资源社会保障部关于开展2013年全国高校毕业生秋季网络招聘月活动的通知',
                    date: '2014-11-11',
                    id: '1234'
                },
                {
                    content: '关于开展我市纯农户家庭离校未就业高校毕业生就业援助工作的通知',
                    date: '2014-11-11',
                    id: '2234'
                },
                {
                    content: '关于选招高校毕业生到有关单位就业见习的通知',
                    date: '2014-11-11',
                    id: '3234'
                },
                {
                    content: '人力资源社会保障部关于开展2013年全国高校毕业生秋季网络招聘月活动的通知',
                    date: '2014-11-11',
                    id: '4234'
                },
                {
                    content: '关于开展我市纯农户家庭离校未就业高校毕业生就业援助工作的通知',
                    date: '2014-11-11',
                    id: '5234'
                },
                {
                    content: '关于选招高校毕业生到有关单位就业见习的通知',
                    date: '2014-11-11',
                    id: '6234'
                }
            ];

            $scope.content = '';

            $scope.formatDate = function(d) {
                return d;
            };

            $scope.setContent = function(policy) {
                var curId = policy.id;
                $scope.postDate = $scope.formatDate(policy.date);
                console.log('curId: ' + curId);
                var doc = $document.find('#policyMessage');
                if (curId) {
                    $http.get('/getPolicyMsg/' + curId).success(function(res) {
                        if (res.status == 'ok') {
                            doc.html(res.content);
                        } else {
                            doc.html('<strong>暂时无法显示</strong>');
                        }
                    }).error(function(err) {
                        doc.html('<strong>暂时无法显示</strong>' +
                        '<br>原因是：<div>' + err + '</div>');
                    });
                }
            }
    }])

    .controller('NewsCtrl', [function() {

    }]);