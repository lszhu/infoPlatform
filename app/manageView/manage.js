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
                controller: 'SystemCtrl'
            })
            .when('/manage/account', {
                templateUrl: 'users/auth/account',
                controller: 'AccountCtrl'
            })
            .when('/manage/carousel', {
                templateUrl: 'users/auth/carousel',
                controller: 'CarouselCtrl'
            });
    }])

    //.controller('PanelCtrl', ['$scope', 'logout', function($scope, logout) {
    //    $scope.logout = logout;
    //}])
    .controller('PanelCtrl', ['$scope', '$http', '$location',
        function($scope, $http, $location) {
            $scope.logout = function() {
                $http.get('/users/logout')
                    .success(function(res) {
                        console.log(res.message);
                        $location.search('management', null);
                        $location.path('/main/home');
                        $location.replace();
                        //location.hash = '';
                        //location.reload();
                    })
                    .error(function(err) {
                        alert('系统出现异常：\n' + JSON.stringify(err));
                    });
            };
        }])

    .controller('CommunityCtrl', ['$scope', '$http', '$document', 'logout',
        function($scope, $http, $document, logout) {
            $scope.community = {};

            // 退出函数
            $scope.logout = logout;
            // 信息上传函数
            $scope.postMsg = function() {
                if (!validPicture()) {
                    alert('请选择宣传图片');
                    return;
                }
                if ($scope.districtId != $scope.community.districtId) {
                    alert('行政区名称与代码不一致，请重新设置。');
                    return;
                }
                $scope.community.name = $scope.districtName;
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
                var districtId = $scope.community.districtId;
                var phone = $scope.community.phone;
                var address = $scope.community.address;
                var overview = $scope.community.overview;
                return !districtId || !phone || !address || !overview;
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
                console.log('districtId: ' + districtId.value);
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
            */
        }
    ])

    .controller('SystemCtrl', ['$scope', '$http', 'logout',
        function($scope, $http, logout) {

            // 退出登录函数
            $scope.logout = logout;

            // 动态更新数据
            $scope.activeData = [
                {collection: 'employee', comment: '个人求职'},
                {collection: 'employer', comment: '企业单位招聘'},
                {collection: 'news', comment: '新闻动态'},
                {collection: 'orgInfo', comment: '企业单位简介'},
                {collection: 'communityInfo', comment: '社区中心简介'},
                {collection: 'suggestion', comment: '投诉建议'}
            ];
            countActiveData($scope.activeData);

            // 人力资源统计数据
            var person = {collection: 'person', comment: '人力资源'};
            counter($scope, 'person', person.collection);
            // 企业单位统计数据
            var org = {collection: 'organization', comment: '企业单位'};
            counter($scope, 'org', org.collection);

            function countActiveData(data) {
                var halfYear = 183 * 24 * 3600 * 1000;
                var condition = {date: {gt: (Date.now() - halfYear)}};
                console.log('condition: ', JSON.stringify(condition));
                for (var i = 0; i < $scope.activeData.length; i++) {
                    counter(data[i], 'total', data[i].collection);
                    counter(data[i], 'recent', data[i].collection, condition);
                }
            }

            function counter(store, attr, collect, condition, regExp) {
                $http.post('/users/counter', {
                    collect: collect,
                    regExp: regExp,
                    condition: condition
                }).success(function(res) {
                    $scope.msgClass = res.status == 'ok' ?
                        'alert-success' : 'alert-danger';
                    $scope.message = res.message;
                    store[attr] = res.count;
                }).error(function (res) {
                    $scope.msgClass = 'alert-danger';
                    $scope.message = 'system error: ' + JSON.stringify(res);
                })
            }

            //counter('figureNum', 'figure', {});
            //counter('carryOverNum', 'figure', {'voucher.id': '10000'});
            //counter('boundFileNum', 'figure', {}, {'voucher.path': '.+'});
            //counter('logNum', 'log', {});
            //counter('logOk', 'log', {status: '成功'});
            //counter('login', 'log', {operation: '登录操作'});
            //counter('loginErr', 'log', {operation: '登录操作', status: '失败'});

    }])

    .controller('AccountCtrl', ['$scope', '$http', 'logout',
        function($scope, $http, logout) {

            // 退出登录函数
            $scope.logout = logout;
            // 保存修改账号的信息
            $scope.account = {};
            // 加载账号列表
            fetchUser();

            $scope.loadUser = function(account) {
                var a = account || {};
                $scope.account.username = a.name;
                $scope.account.originalName = a.name;
                $scope.account.description = a.description;
                $scope.account.rights = a.rights;
                $scope.account.enabled = a.enabled;
            };

            $scope.deleteUser = function(name) {
                $scope.message = '';
                if (!name) {
                    return;
                }
                if (!confirm('确认要删除该用户？')) {
                    return;
                }
                console.log('account name: ' + name);
                $http.post('/users/deleteAccount', {name: name})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.msgClass = 'alert-success';
                            $scope.accounts = $scope.accounts.filter(
                                function(e) {return e.name != name;});
                        } else {
                            $scope.msgClass = 'alert-danger';
                            $scope.message = res.message ?
                                res.message : '未知错误，请重新登录后尝试';
                        }
                    }).error(function(res) {
                        $scope.msgClass = 'alert-danger';
                        $scope.message = '系统错误: ' + JSON.stringify(res);
                    });
            };

            $scope.modifyUser = function() {
                $scope.accountmessage = '';
                if (!$scope.account.username) {
                    alert('用户名不能为空');
                    return;
                }
                if ($scope.account.password != $scope.account.retryPassword) {
                    alert('两次输入的密码不一致');
                    return;
                }

                // 加密用户名和密码
                //$scope.account.username = CryptoJS
                //    .SHA1($scope.account.username.toString()).toString();
                var password = $scope.account.password;
                password = password ? password.toString() : '';
                $scope.account.password = CryptoJS.SHA1(password).toString();
                console.log('upload account: %o', $scope.account);
                $http.post('/users/modifyAccount', {account: $scope.account})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            fetchUser();
                            $scope.account = {};
                            $scope.msgClass = 'alert-success';
                        } else {
                            $scope.msgClass = 'alert-danger';
                            $scope.message = res.message ?
                                res.message : '未知错误，请重新登录后尝试';
                        }
                    }).error(function(res) {
                        $scope.msgClass = 'alert-danger';
                        $scope.message = '系统错误: ' + JSON.stringify(res);
                    });
            };

            function fetchUser() {
                $http.get('/users/getAccount')
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.accounts = res.accounts ? res.accounts : [];
                            $scope.msgClass = 'alert-success';
                            $scope.message = res.message;
                        } else {
                            $scope.msgClass = 'alert-danger';
                            $scope.message = res.message ?
                                res.message : '未知错误，请重新登录后尝试';
                        }
                    }).error(function(res) {
                        $scope.msgClass = 'alert-danger';
                        $scope.message = '系统错误: ' + JSON.stringify(res);
                    });
            }
    }])

    .controller('CarouselCtrl', [function() {

    }]);