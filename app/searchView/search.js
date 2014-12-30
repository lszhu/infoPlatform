'use strict';

angular.module('myApp.search', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/search/job', {
                templateUrl: 'searchView/job.html',
                controller: 'JobCtrl'
            })
            .when('/search/enterprise', {
                templateUrl: 'searchView/enterprise.html',
                controller: 'EnterpriseCtrl'
            })
            .when('/search/manpower', {
                templateUrl: 'searchView/manpower.html',
                controller: 'ManpowerCtrl'
            })
            .when('/search/worker', {
                templateUrl: 'searchView/worker.html',
                controller: 'WorkerCtrl'
            });
    }])

    .controller('JobCtrl', ['$scope', '$http', '$sce', '$location',
        '$window', 'pagination', 'formatInfo', 'filterFilter',
        function($scope, $http, $sce, $location,
                 $window, pagination, formatInfo, filterFilter) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 总页面数
            var totalPage = 0;
            // 当前页面条目编号起始值
            $scope.baseNumber = 1;

            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;

            // 基本查询条件
            $scope.job = {limit: limit};
            // 当前页码，注意不能为1（否则无法自动加载第一页）
            $scope.curPage = 0;
            // 当前页面列表
            $scope.pageList = [];

            // 当前数据列表
            $scope.itemList = [];

            // 待删除项目表
            $scope.removalList = [];

            // 设置激活页面（函数）
            $scope.active = pagination.active;
            // 向前翻一个导航列表
            $scope.previousList = function() {
                console.log(totalPage, $scope.pageList, pageNav);
                $scope.pageList = pagination
                    .previousNavBar(totalPage, $scope.pageList, pageNav);
            };
            // 向后翻一个导航列表
            $scope.nextList = function() {
                console.log(totalPage, $scope.pageList, pageNav);
                $scope.pageList = pagination
                    .nextNavBar(totalPage, $scope.pageList, pageNav);
            };

            $scope.queryJob = function(page) {
                // 如果为真的改变当前活动页面则直接返回
                if (page == $scope.curPage) {
                    return;
                }
                if (!page) {
                    page = $scope.curPage;
                }
                page = page < 1 ? 1 : page;
                // 设置当前页面
                $scope.curPage = page;
                // 清空选中列表
                $scope.removalList = [];

                $scope.job.skip = (page - 1) * limit;
                console.log('districtId: ' + $scope.districtId);
                $scope.job.districtId = $scope.districtId;
                //console.log($scope.job);
                $http.post('/searchJob', $scope.job)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.itemListRaw = res.jobList;
                            $scope.itemList = res.jobList;
                            totalPage = Math.ceil(res.count / limit);
                            $scope.pageList = pagination
                                .pageList(totalPage, $scope.curPage, pageNav);
                            $scope.baseNumber = (page - 1) * limit + 1;
                            $window.scrollTo(x, y)
                        }
                        //console.log(res.jobList);
                        //console.log('$scope.pageList: %o', $scope.pageList);
                    })
                    .error(function(err) {
                        console.log('无法获取招聘信息，错误原因：%o', err);
                    });
            };
            // 用于初始化列表信息
            $scope.queryJob(1);

            // 跟踪过滤关键字的变化
            $scope.$watch('quickFilter', function(newValue, oldValue) {
                if (newValue == oldValue) {
                    return;
                }
                $scope.itemList = filterFilter($scope.itemListRaw, newValue);
                $scope.removalList = [];
            });

            // 获取单位介绍信息
            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.get('/searchInformation/' + infoId)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.info);
                            $scope.information.content =
                                $sce.trustAsHtml($scope.information.content);
                        } else {
                            console.log('没有相关单位的信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        console.log('因出现异常，无法查询到相关信息\n' + err);
                    });
            };

            $scope.parseSalary = function(salary) {
                if (salary) {
                    return salary;
                } else {
                    return '面议';
                }
            };

            $scope.getDate = function(date) {
                return !date ? '未知' : date.toString().split('T')[0];
            };

            // 管理模式设置
            function management() {
                var manage = $location.search().hasOwnProperty('management');
                //console.log('$scope.manage:' + JSON.stringify(manage));
                if (manage) {
                    $http.get('/users/clientType')
                        .success(function(res) {
                            console.log(res.type);
                            if (res.type == 'register') {
                                $scope.manage = true;
                            } else {
                                $location.search('management', undefined);
                                $scope.manage = false;
                            }
                        });
                }
            }
            management();

            $scope.gotoPanel = function() {
                $location.path('/users/panel');
            };

            $scope.logout = function() {
                $http.get('/users/logout')
                    .success(function(res) {
                        console.log(res.message);
                        $location.search('management', undefined);
                        //$location.path('/search/job');
                        location.reload();
                    })
                    .error(function(err) {
                        alert('系统出现异常：\n' + err);
                    });
            };

            $scope.reverse = function(index) {
                $scope.removalList[index] = !$scope.removalList[index];
                //console.log('reversed index: ' + index);
            };

            $scope.selectAll = function(selected) {
                $scope.selectedAll = !selected;
                for (var i = 0; i < limit; i++) {
                    $scope.removalList[i] = !selected;
                }
                //console.log($scope.removelList);
            };

            // 将选中条目的时间参数抽出，作为删除的条件
            function getRemovals(selList) {
                var items = $scope.itemList;
                var dates = [];
                for (var i = 0, len = selList.length; i < len; i++) {
                    if (selList[i]) {
                        dates.push(items[i].date);
                    }
                }
                return dates;
            }

            // 根据条件删除条目
            function removeItemList(dates) {
                if (!dates || !dates.length) {
                    return;
                }
                console.log('removing');
                $http.post('/users/removeJob', {date: dates})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            console.log('remove ok');
                            location.reload();
                        }
                        console.log(res.message);
                    })
                    .error(function(err) {
                        console.log('error: %o', err);
                    });
            }

            // 删除所有选中条目
            $scope.removeSelected = function() {
                var dates = getRemovals($scope.removalList);
                if (dates.length && !confirm('确实要删除这些信息吗')) {
                    return;
                }
                removeItemList(dates);
            };

            $scope.removeItem = function(index) {
                var date = $scope.itemList[index].date;
                if (!confirm('确实要删除这些信息吗')) {
                    return;
                }
                console.log('date: %o', $scope.itemList[index].date);
                removeItemList([date]);
            }
        }
    ])

    .controller('EnterpriseCtrl', ['$scope', '$http', '$sce', 'page',
        'formatInfo', function($scope, $http, $sce, page, formatInfo) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息
            $scope.pageOption = {};
            // 查询条件
            $scope.org = {};

            $scope.searchOrganization = function () {
                $scope.org.districtId = $scope.districtId;
                console.log($scope.org);
                $http.post('/searchOrganization', $scope.org)
                    .success(function (res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.list, limit, pageNav, x, y);
                            console.log('org info length: ' + res.list.length);
                        } else {
                            alert('未查询到任何求职信息\n' + res.message);
                        }
                    })
                    .error(function (err) {
                        alert('因出现异常，无法正确查询到相关信息\n' + err);
                    });
            };

            $scope.getMsg = function(infoId) {
                //console.log('informationId: ' + infoId);
                $http.get('/searchInformation/' + infoId)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.information = formatInfo(res.info);
                            //$scope.information = res.info;
                            $scope.information.content =
                                $sce.trustAsHtml($scope.information.content);
                            //$scope.information.heading = res.info.name;
                            //$scope.information.reference =
                            //    makeReference(res.info);
                            //console.log('heading: %o', res.info.name);
                        } else {
                            console.log('没有相关单位的信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        console.log('因出现异常，无法查询到相关信息\n' + err);
                    });
            };

            //function makeReference(info) {
            //    var ref = '';
            //    if (info.hasOwnProperty('date')) {
            //        var d = new Date(info.date);
            //        ref += '发布日期：';
            //        ref += d.getFullYear() + '-';
            //        ref += d.getMonth() + 1;
            //        ref += '-' + d.getDate();
            //    }
            //    if (info.hasOwnProperty('source')) {
            //        ref += info.source;
            //    }
            //    return ref;
            //}
        }
    ])

    .controller('ManpowerCtrl', ['$scope', '$http', 'page',
        function($scope, $http, page) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            $scope.pageOption = {};
            // 查询条件
            $scope.manpower = {};


            $scope.searchManpower = function() {
                $scope.manpower.districtId = $scope.districtId;
                console.log('manpower condition: %o', $scope.manpower);
                $http.post('/searchManpower', $scope.manpower)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.list, limit, pageNav, x, y);
                        } else {
                            alert('未查询到任何求职信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('因出现异常，无法正确查询到相关信息\n' + err);
                    });
            };

            $scope.getDate = function(date) {
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

        }
    ])

    .controller('WorkerCtrl', ['$scope', '$http', 'page',
        function($scope, $http, page) {
            // 每页的显示数目
            var limit = 50;
            // 页码导航条显示的页码数
            var pageNav = 5;
            // 设置翻页时自动滚屏到x/y坐标
            var x = 0;
            var y = 450;
            // 用于保存页面显示相关信息，此处还仅是为了能调用其初始化函数
            $scope.pageOption = {};
            // 查询条件
            $scope.worker = {};

            $scope.searchWorker = function() {
                $scope.worker.districtId = $scope.districtId;
                console.log('manpower condition: %o', $scope.worker);
                $http.post('/searchWorker', $scope.worker)
                    .success(function(res) {
                        if (res.status == 'ok') {
                            $scope.pageOption =
                                page(res.list, limit, pageNav, x, y);
                        } else {
                            alert('未查询到任何求职信息\n' + res.message);
                        }
                    })
                    .error(function(err) {
                        alert('因出现异常，无法正确查询到相关信息\n' + err);
                    });
            };
        }
    ]);