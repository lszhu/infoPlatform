'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.home',
    'myApp.etc',
    'myApp.message',
    'myApp.search',
    'myApp.manage',
    'myApp.version'
]).
    config(['$routeProvider', function($routeProvider) {
        $routeProvider.otherwise({redirectTo: '/main/home'});
    }]);

angular.module('myApp')
    .controller('MainCtrl', ['$scope', '$http',
        function($scope, $http) {
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
        }
    ]);