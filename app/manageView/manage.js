'use strict';

angular.module('myApp.manage', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/manage/user', {
                templateUrl: 'manageView/user.html',
                controller: 'ManageCtrl'
            })
            .when('/manage/post', {
                templateUrl: 'manageView/post.html',
                controller: 'ManageCtrl'
            })
            .when('/manage/edit', {
                templateUrl: 'manageView/edit.html',
                controller: 'EditCtrl'
            });
    }])

    .controller('EditCtrl', ['$scope', '$http', '$document',
        function($scope, $http, $document) {
            // 初始化企业信息
            $scope.employer = {};

            // 信息上传函数
            $scope.postMsg = function() {
                $scope.employer.introduction =
                    $document.find('.note-editable').html();
                console.log('employer: %o', $scope.employer.picture);
                $scope.employer.districtId = $scope.districtId;
                $http.post('/editOrgInfo', {employer: $scope.employer})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            alert('您成功发布了企业介绍信息！');
                        } else {
                            alert('信息发布失败，原因是：' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('信息发布失败，原因是：' + err);
                    });
            };

            $scope.postDisabled = function() {
                return false;
                var name = $scope.employer.name;
                var code = $scope.employer.code;
                var phone = $scope.employer.phone;
                //var picture = $scope.employer.picture;
                var address = $scope.employer.address;
                var overview = $scope.employer.overview;
                return !name || !code || !phone || !address ||
                    !address.trim() || !overview;
            };

        }
    ])

    .controller('ManageCtrl', [function() {

    }]);