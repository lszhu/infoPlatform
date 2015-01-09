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
                controller: 'LoginCtrl'
            })
            //.when('/main/policy', {
            //    templateUrl: 'mainView/policy.html',
            //    controller: 'PostPolicyCtrl'
            //})
            .when('/main/news', {
                templateUrl: 'users/auth/news',
                controller: 'PostNewsCtrl'
            })
            .when('/main/home', {
                templateUrl: 'mainView/home.html',
                controller: 'HomeCtrl'
            });
    }])

    .controller('LoginCtrl', ['$scope', '$http', '$location',
        function($scope, $http, $location) {
            $scope.acc = {};
            $scope.login = function() {
                var id = encrypt($scope.acc.u);
                //console.log('user id: ' + id);
                $http.post('/users/token', {id: id})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            //console.log('token: ' + res.token);
                            tryLogin(res.token);
                        } else {
                            alert(res.message);
                        }
                    })
                    .error(function(err) {
                        console.log('login error: %o', err);
                        alert('未知因素导致登录失败');
                    })
            };

            function tryLogin(token) {
                var acc = {
                    u: encrypt($scope.acc.u),
                    p: encrypt($scope.acc.p, token)
                };
                $http.post('/users/login', acc)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            console.log('登录成功');
                            $location.url('/users/panel');
                        } else {
                            console.log('res: %o', res);
                            alert('用户名或密码错误');
                        }
                    })
                    .error(function(err) {
                        console.log('login error: %o', err);
                        alert('未知因素导致登录失败');
                    });
            }

            // 加密函数，data为原始数据，token为hash操作的附件信息
            function encrypt(data, token) {
                var d = data || '';
                // 第一次hash
                var hash = CryptoJS.SHA1(d.toString()).toString();
                // 如果token未指定，则返回
                if (!token) {
                    return hash;
                }
                // 第二次hash，加入token信息
                hash = CryptoJS.SHA1(hash + token);

                return hash.toString();
            }
        }])

    //.controller('PostPolicyCtrl', ['$scope', '$http', '$document',
    //    function($scope, $http, $document) {
    //        // 初始化投诉建议信息
    //        $scope.policy = {};
    //
    //        console.log('in policy');
    //        // 信息上传函数
    //        $scope.postMsg = function() {
    //            console.log('in policy');
    //            $scope.policy.content =
    //                $document.find('.note-editable').html();
    //            console.log('districtId: %s', $scope.districtId);
    //            $scope.policy.districtId = $scope.districtId;
    //            $http.post('/postPolicy', {policy: $scope.policy})
    //                .success(function(res) {
    //                    if (res.status == 'ok') {
    //                        alert('您成功转载政策法规信息！');
    //                    } else {
    //                        alert('信息提交失败，原因是：' + res.message);
    //                    }
    //                })
    //                .error(function(err) {
    //                    alert('信息提交失败，原因是：' + err);
    //                });
    //        };
    //
    //    }
    //])

    .controller('PostNewsCtrl', ['$scope', '$http', '$document', '$location',
        function($scope, $http, $document, $location) {
            // 初始信息
            $scope.news = {};

            // 信息上传函数
            $scope.postMsg = function() {
                $scope.news.content =
                    $document.find('.note-editable').html();
                //console.log('districtId: %s', $scope.districtId);
                if (!validMsg($scope.news)) {
                    alert('请将信息填写完整后再行发布');
                    return;
                }
                $scope.news.districtId = $scope.districtId;
                $http.post('/users/postNews', {news: $scope.news})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            alert('您成功发布了就业动态新闻！');
                        } else {
                            alert('信息提交失败，原因是：' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('信息提交失败，原因是：' + err);
                    });
            };

            // 退出登录状态
            $scope.logout = function() {
                $http.get('/users/logout')
                    .success(function(res) {
                        console.log(res.message);
                        $location.search('management', null);
                        $location.path('/')
                    })
                    .error(function(err) {
                        alert('系统出现异常：\n' + err);
                    });
            };

            function validMsg(news) {
                return news && news.heading &&
                    news.heading.toString().length > 2 &&
                    news.type && news.content &&
                    news.content.toString().length > 10;
            }

        }
    ])

    .controller('HomeCtrl', ['$scope', '$http', '$sce', 'formatInfo',
        function($scope, $http, $sce, formatInfo) {
            // 广告位个数
            var adPosition = 3;
            // 页面显示的条目数
            var limit = 10;

            $scope.formatDate = function(date) {
                return !date ? '未知' : date.toString().split('T')[0];
            };

            function queryNewsList(n) {
                var factor = {};
                if (n && parseInt(n)) {
                    factor.limit = n;
                }
                $http.post('/getNewsMsg', factor)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.news = res.list || [];
                        }
                        console.log('news: %o', $scope.news);
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
            $scope.getMsg = function(infoId) {
                $http.post('/getNewsMsg', {infoId: infoId})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.list[0]);
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
                            $scope.market = res.list || [];
                            //$scope.market = market.slice(0, limit);
                        }
                        console.log('market: %o', $scope.market);
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
                    // use timestamp to get picture
                    date: 'placeholder'
                };
                for (var i = infoList.length; i < adPosition; i++) {
                    infoList[i] = new Object(ad);
                }
                return infoList;
            }
        }])

    .controller('View1Ctrl', [function() {

    }]);