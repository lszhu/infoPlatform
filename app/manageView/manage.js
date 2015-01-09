'use strict';

angular.module('myApp.manage', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/users/panel', {
                templateUrl: 'users/panel',
                controller: 'PanelCtrl'
            })
            .when('/manage/community', {
                templateUrl: 'users/auth/community',
                controller: 'CommunityCtrl'
            })
            .when('/manage/suggestion', {
                templateUrl: 'users/auth/suggestion',
                controller: 'ShowSuggestionCtrl'
            })
            .when('/manage/system', {
                templateUrl: 'users/auth/system',
                controller: 'CommunityCtrl'
            })
            .when('/manage/account', {
                templateUrl: 'users/auth/account',
                controller: 'AccountCtrl'
            })
            .when('/manage/carousel', {
                templateUrl: 'users/auth/carousel',
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
                        alert('系统出现异常：\n' + JSON.stringify(err));
                    });
                //$location.path('/users/logout');
                //location.hash = '#/users/logout';
                //location.reload();
            };

        }])

    .controller('AccountCtrl', [function() {

    }])

    .controller('CommunityCtrl', ['$scope', '$http', '$document',
        function($scope, $http, $document) {
            $scope.community = {};

            // 信息上传函数
            $scope.postMsg = function() {
                if (!validPicture()) {
                    alert('请选择宣传图片');
                    return;
                }
                $http.post('/users/postCommunity',
                    {community: $scope.community})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            alert('您成功发布了社区介绍信息！');
                        } else {
                            alert('信息发布失败，原因是：' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('信息发布失败，原因是：' + err);
                    });
                postPicture();
            };

            $scope.postDisabled = function() {
                //return false;
                var name = $scope.community.name;
                var districtId = $scope.community.districtId;
                var phone = $scope.community.phone;
                var address = $scope.community.address;
                var overview = $scope.community.overview;
                return !name || !districtId || !phone || !address || !overview;
            };

            $scope.test = postPicture;
            function postPicture() {
                var frame = $document.find('iframe')[0];
                //var frame = angular.element('#fileUpload').contents();
                if (!frame) {
                    console.log('找不到要提交的图片');
                    return;
                }
                frame = frame.contentDocument || frame.contentWindow.document;
                console.log(frame);
                var districtId = frame.getElementById('code');
                console.log(districtId);
                var format = frame.getElementById('format');
                var picture = frame.getElementById('picture');
                format.value = picture.value.split('.').slice(-1)[0];
                districtId.value = $scope.community.districtId;
                frame.getElementById('submit').click();
            }

            function validPicture() {
                // 获取图片输入框中的信息（在嵌入的iframe中）
                //var picture = $scope.community.picture;
                var frame = $document.find('iframe')[0];
                if (!frame) {
                    console.log('找不到要提交的图片');
                    return;
                }
                frame = frame.contentDocument || frame.contentWindow.document;
                var picture = frame.getElementById('picture');
                return picture.value != '';
            }

        }])

    .controller('ShowSuggestionCtrl', ['$scope', '$http', '$sce',
        'formatInfo', 'pagination', 'management', 'filterFilter',
        function($scope, $http, $sce, formatInfo,
                 pagination, management, filterFilter) {

            // 初始化页面参数
            $scope.page = pagination({y: 300, limit: 20,
                target: '/users/getSuggestion'});

            // 用于初始化列表信息
            $scope.page.queryItems(1);
            // 初始化管理操作
            $scope.manage = management({removeUrl: '/users/removeSuggestion'});

            // 用于显示具体建议内容
            $scope.information = {};

            $scope.formatDate = function (date) {
                return !date ? '未知' : date.toString().split('T')[0];
            };

            $scope.showMsg = function(suggestion) {
                var s = $scope.information;
                s.heading = '来自网友' + suggestion.name + '的投诉建议';
                s.content = $sce.trustAsHtml(suggestion.suggestion);
                s.reference = '';
            };

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

            // 获取指定页面的数据，同时清空删除列表及状态
            $scope.queryItems = function (p) {
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

            /* 未使用，因为这里不用单独获取介绍信息
            // 获取介绍信息
            $scope.getMsg = function (infoId) {
                //console.log('informationId: ' + infoId);
                $http.post('/users/getSuggestion', {infoId: infoId})
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
            */
        }
    ]);