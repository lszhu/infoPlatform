'use strict';

angular.module('myApp.manage', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/users/panel', {
                templateUrl: 'users/panel',
                controller: 'PanelCtrl'
            })
            .when('/manage/user', {
                templateUrl: 'manageView/user.html',
                controller: 'UserCtrl'
            })
            .when('/manage/community', {
                templateUrl: 'users/community',
                controller: 'CommunityCtrl'
            })
            .when('/manage/suggestion', {
                templateUrl: 'users/suggestion',
                controller: 'SuggestionCtrl'
            })
            .when('/manage/system', {
                templateUrl: 'users/system',
                controller: 'CommunityCtrl'
            })
            .when('/manage/account', {
                templateUrl: 'users/account',
                controller: 'CommunityCtrl'
            })
            .when('/manage/carousel', {
                templateUrl: 'users/carousel',
                controller: 'CommunityCtrl'
            });
    }])

    .controller('PanelCtrl', ['$scope', '$http', '$location',
        function($scope, $http, $location) {

            $scope.logout = function() {
                $http.get('/users/logout')
                    .success(function(res) {
                        console.log(res.message);
                        $location.path('/main/homepage');
                        location.reload();
                    })
                    .error(function(err) {
                        alert('系统出现异常');
                    });
                //$location.path('/users/logout');
                //location.hash = '#/users/logout';
                //location.reload();
            };

        }])

    .controller('UserCtrl', [function() {

    }])

    .controller('CommunityCtrl', [function() {

    }])

    .controller('SuggestionCtrl', ['$scope', '$http', '$sce', 'formatInfo',
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
            $scope.$watch('quickFilter', function (newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.page.params.itemList =
                    filterFilter($scope.page.params.itemListRaw, newValue);
                $scope.manage.params.removalList = [];
                $scope.manage.params.selectedAll = false;
            });

            $scope.formatDate = function (date) {
                return !date ? '未知' : date.toString().split('T')[0];
            };

            // 获取指定页面的数据，同时清空删除列表及状态
            $scope.queryItems = function (p) {
                // 清除快速过滤关键字
                $scope.quickFilter = '';
                $scope.manage.params.removalList = [];
                $scope.manage.params.selectedAll = false;
                $scope.page.queryItems(p);
            };

            // 获取介绍信息
            $scope.getMsg = function (infoId) {
                //console.log('informationId: ' + infoId);
                $http.post('/getNewsMsg', {infoId: infoId})
                    .success(function (res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.list[0]);
                            $scope.information.content =
                                $sce.trustAsHtml($scope.information.content);
                        } else {
                            console.log('没有相关单位的信息\n' + res.message);
                        }
                    })
                    .error(function (err) {
                        console.log('因出现异常，无法查询到相关信息\n' + err);
                    });
            };

            // 删除选中数据项
            $scope.removeItems = function (p) {
                $scope.manage.removeItems(p, $scope.page.params.itemList,
                    $scope.page.params.itemListRaw);
            };
        }
    ]);