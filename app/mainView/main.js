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
            // 广告位个数
            var adPosition = 3;
            // 页面显示的条目数
            var limit = 10;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 400;

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

            function queryNewsList(n) {
                var factor = {list: true, districtId: $scope.districtId};
                if (n && parseInt(n)) {
                    factor.limit = n;
                }
                $http.post('/getNewsMsg', factor)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            var news =
                                page(res.newsList, limit, pageNav, x, y);
                            $scope.news = news.dataToShow;
                        }
                        console.log($scope.news);
                    })
                    .error(function(err) {
                        console.log('无法获取人力资源与就业服务政策信息，' +
                        '错误原因：%o', err);
                    });
            }
            // 用于初始化列表信息
            queryNewsList(limit);

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

            function queryJob(n) {
                var factor =  {districtId: $scope.districtId};
                if (n && parseInt(n)) {
                    factor.limit = n;
                }
                $http.post('/searchJob', factor)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.market = res.jobList || [];
                            //$scope.market = market.slice(0, limit);
                        }
                        console.log($scope.market);
                    })
                    .error(function(err) {
                        console.log('无法获取招聘信息，错误原因：%o', err);
                    });
            }
            queryJob(limit);

            function queryOrgInfo(queryLimit, responseLimit) {
                var factor =  {};//{districtId: $scope.districtId};
                if (queryLimit && parseInt(queryLimit)) {
                    factor.queryLimit = queryLimit;
                }
                if (responseLimit && parseInt(responseLimit)) {
                    factor.responseLimit = responseLimit;
                }
                $http.post('/searchInformation', factor)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            //console.log('res.info: %o', res.info);
                            var orgInfo = res.info || [];
                            $scope.orgInfo = addPlaceholder(orgInfo);
                            //console.log('orgInfo %o', $scope.orgInfo);
                        }
                        //console.log($scope.market);
                    })
                    .error(function(err) {
                        console.log('无法获取招聘信息，错误原因：%o', err);
                    });
            }
            // 0表示queryLimit不受限制
            queryOrgInfo(0, adPosition);

            function addPlaceholder(info) {
                var infoList = info;
                if (info && info.length >= 3) {
                    return info;
                } else if (!info || !info.length) {
                    infoList = [];
                }
                var ad = {
                    name: '提供一个展示你自己的机会',
                    overview: '随着网络的发展，越来越多的企业通过互联网进行' +
                    '招聘工作。同时企业也发现，网络招聘要发挥最大的作用，' +
                    '仍需经历较长的历程。基于互联网的真正服务于企业招聘管理，' +
                    '以众多优质互联网资源为依托，发布圈内招聘信息，为求职者' +
                    '提供人性化、个性化、专业化的信息服务，以让优质人才和优' +
                    '秀企业及时相遇为己任。',
                    address: '中国湖南省永州市',
                    phone: '8888888',
                    picture: 'images/12.jpg'
                };
                for (var i = infoList.length; i < adPosition; i++) {
                    infoList[i] = new Object(ad);
                }
                return infoList;
            }
        }])

    .controller('View1Ctrl', [function() {

    }]);