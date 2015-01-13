'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.service',
    'myApp.directive',
    'myApp.home',
    'myApp.etc',
    'myApp.message',
    'myApp.search',
    'myApp.manage'
    //'myApp.version'
]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/main/home'});
    }]);

angular.module('myApp')
    .controller('MainCtrl', ['$scope', '$http', '$location', '$timeout',
        function($scope, $http, $location, $timeout) {
            $scope.districts = '';
            getDistrict();

            // 由服务器获取行政区划代码及对应名称
            function getDistrict() {
                $http.get('/district')
                    .success(function(res) {
                        $scope.districts = res.district;
                        $scope.districtId = res.districtId;
                        $scope.tmpDistrictId = res.districtId;
                        // get parent district Id
                        var upLevel = res.districtId.slice(0, -2);
                        $scope.districtName = $scope
                            .districts[upLevel][res.districtId];
                        $scope.tmpDistrictName = $scope.districtName;
                    }).error(function(err) {
                        console.log('未知外界原因，无法获取行政区信息，%o', err);
                        alert('未知外界原因，无法获取行政区信息' +
                            JSON.stringify(err));
                    });
            }

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
            // 用于记录定时器
            var start, end;
            // 登录管理后台
            $scope.login = function() {
                if ($scope.initLogin) {
                    $location.url('/main/login');
                    return;
                }
                // 先清除定时器后重设，200ms之后设置登录控制参数，2秒后再恢复禁用
                $timeout.cancel(start);
                start = $timeout(function() {
                    $scope.initLogin = true;
                }, 500);
                $timeout.cancel(end);
                end = $timeout(function() {
                    $scope.initLogin = false;
                }, 2000);
                //location.reload();
            };

            $scope.auxInfo = {};
            getAuxInfo();
            // 获取辅助显示信息，如筹备单位、备案号，友情链接等
            function getAuxInfo() {
                $http.get('/auxInfo')
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.auxInfo = res.info;
                            // 修改网页标题
                            document.title = (res.info.title);
                        } else {
                            console.log('无法获取辅助信息');
                        }
                    })
                    .error(function(err) {
                        console.log('无法获取辅助信息：\n%o', err);
                    });
            }
        }
    ]);