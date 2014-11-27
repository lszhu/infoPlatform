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

        // 控制提交按钮的可用性
        $scope.postDisabled = function() {
            var name = $scope.name;
            var idNumber = $scope.idNumber;
            var phone = $scope.phone;
            return !name || !name.trim() || !idNumber ||
                !idNumber.trim() || !phone || !phone.trim();
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
    }])

    .controller('PolicyCtrl', [function() {

    }]);