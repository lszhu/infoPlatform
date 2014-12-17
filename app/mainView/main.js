'use strict';

angular.module('myApp.home', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/main/view1', {
                templateUrl: 'mainView/view1.html',
                controller: 'View1Ctrl'
            })
            .when('/main/login', {
                templateUrl: 'mainView/login.html',
                controller: 'View1Ctrl'
            })
            .when('/main/home', {
                templateUrl: 'mainView/home.html',
                controller: 'HomeCtrl'
            });
    }])

    .controller('HomeCtrl', ['$scope', '$http', '$sce', 'formatInfo',
        'page', function($scope, $http, $sce, formatInfo, page) {
            // 每页的显示数目
            var limit = 20;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 400;

            $scope.formatDate = function(date) {
                var d = new Date(date);
                if (d == 'Invalid Date') {
                    return '';
                }
                var ref = '';
                ref += d.getFullYear() + '-';
                ref += d.getMonth() + 1;
                ref += '-' + d.getDate();
                return ref;
            };

            function queryNewsList() {
                var factor = {list: true, districtId: $scope.districtId};
                $http.post('/getNewsMsg', factor)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            var news =
                                page(res.newsList, limit, pageNav, x, y);
                            $scope.news = news.dataToShow.slice(0, 10);
                        }
                        //console.log($scope.news);
                    })
                    .error(function(err) {
                        console.log('无法获取人力资源与就业服务政策信息，' +
                        '错误原因：%o', err);
                    });
            }
            // 用于初始化列表信息
            queryNewsList();

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

            function queryJob() {

                $http.post('/searchJob', {districtId: $scope.districtId})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            var market = res.jobList ? res.jobList : [];
                            $scope.market = market.slice(0, 10);
                        }
                        //console.log($scope.market);
                    })
                    .error(function(err) {
                        console.log('无法获取招聘信息，错误原因：%o', err);
                    });
            }
            queryJob();
        }])

    .controller('View1Ctrl', [function() {

    }]);