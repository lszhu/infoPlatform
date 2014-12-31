'use strict';

angular.module('myApp.service', [])

    .factory('formatInfo', [function() {

        function makeReference(info) {
            if (!info) {
                return '';
            }
            var ref = '';
            if (info.hasOwnProperty('date')) {
                //var d = new Date(info.date);
                //ref += '（ 发布日期：';
                //ref += d.getFullYear() + '-';
                //ref += d.getMonth() + 1;
                //ref += '-' + d.getDate();
                ref = '发布日期：' + info.date.toString().split('T')[0];
            }
            if (info.hasOwnProperty('source')) {
                ref += '； 消息来源：' + info.source;
            }
            return ref ? '（' + ref + ' ）' : '';
        }

        function formatInfo(info) {
            if (!info) {
                return {};
            }
            var msg = {};
            msg.heading = info.heading ? info.heading : info.name;
            msg.content = info.content ? info.content : info.introduction;
            msg.reference = makeReference(info);
            return msg;
        }

        return formatInfo;
    }])

    .factory('job', ['$http', function($http) {

        function getJob(condition) {
            var job = {};
            $http.post('/searchJob', {condition: condition})
                .success(function(res) {
                    if (res.status == 'ok') {
                        var tmp = res.jobList;
                        tmp.sort(function(a, b) {
                            if (a.date == b.date) {
                                return 0;
                            } else {
                                return a.date < b.date ? 1 : -1;
                            }
                        });
                        job.list = tmp;
                    }
                })
                .error(function(err) {
                    console.log('无法获取招聘信息，错误原因：%o', err);
                    job.list = [];
                });
            return job;
        }

        return getJob;
    }])

    .factory('pagination', ['$window', '$http', function($window, $http) {

        // 分页相关参数
        var params = {
            target: '/searchJob',   // 查询的目标路径
            limit: 50,              // 每页显示的条目数目
            pageNav: 5,             // 页码导航条显示的页码数
            x: 0,                   // 自动滚屏到横坐标
            y: 450,                 // 自动滚屏到纵坐标
            condition: {},          // 查询条件
            curPage: 0,             // 当前页码（为1时不会自动加载第一页）
            totalPage: 0,           // 符合条件的条目分页后的页面数
            pageList: [],           // 导航条的页面列表
            itemList: [],           // 列表使用的经过快速过滤的条目
            itemListRaw: []         // 未经快速过滤的条目
        };

        function active(p1, p2) {
            return p1 == p2 ? 'active' : '';
        }

        function pageList() {
            var totalPage = params.totalPage;
            var curPage = params.curPage;
            var pageNav = params.pageNav;
            var first, last;
            if (curPage <= Math.ceil(pageNav / 2)) {
                first = 1;
                last = totalPage < pageNav ? totalPage : pageNav;
            } else if ((totalPage - curPage) < Math.ceil(pageNav / 2)) {
                last = totalPage;
                first = last - pageNav + 1;
            } else {
                first = curPage - Math.floor(pageNav / 2);
                last = first + pageNav - 1;
            }
            var pages = [];
            for (var i = first; i <= last; i++) {
                pages.push(i);
            }
            params.pageList = pages;
            return pages;
        }

        function nextNavBar() {
            var totalPage = params.totalPage;
            var curPageList = params.pageList;
            var pageNav = params.pageNav;

            if (curPageList.length < pageNav) {
                return curPageList;
            }
            //console.log(totalPage, curPageList, pageNav);
            var total = [];
            for (var i = 1; i <= totalPage; i++) {
                total.push(i);
            }
            var last = curPageList[pageNav - 1];
            if (last + pageNav <= totalPage) {
                params.pageList = total.slice(last, last + pageNav);
                return total.slice(last, last + pageNav);
            } else {
                params.pageList = total.slice(totalPage - pageNav);
                return total.slice(totalPage - pageNav);
            }
        }

        function previousNavBar() {
            var totalPage = params.totalPage;
            var curPageList = params.pageList;
            var pageNav = params.pageNav;

            if (curPageList.length < pageNav) {
                return curPageList;
            }

            var total = [];
            for (var i = 1; i <= totalPage; i++) {
                total.push(i);
            }
            var first = curPageList[0];
            if (first > pageNav) {
                params.pageList =
                    total.slice(first - pageNav -1, first - 1);
                return total.slice(first - pageNav -1, first - 1);
            } else {
                params.pageList = total.slice(0, pageNav);
                return total.slice(0, pageNav);
            }
        }

        // 获取符合约束条件的总求职信息条目数量，以及分页后指定页面具体信息
        function queryItems(page) {
            // 如果为真的改变当前活动页面则直接返回
            if (page == params.curPage) {
                return;
            }
            if (!page) {
                page = 1;
            }

            // 设置当前页面
            params.curPage = page;
            // 清空选中列表
            params.removalList = [];
            params.selectedAll = false;

            // 设置查询条件
            var cond = params.condition;
            cond.limit = params.limit;
            cond.skip = (page - 1) * params.limit;
            if (params.districtId) {
                cond.districtId = params.districtId;
            }

            console.log('condition: %o', cond);
            // 查询数据
            $http.post(params.target, cond)
                .success(function(res) {
                    if (res.status != 'ok') {
                        console.log(res.message);
                        return;
                    }
                    params.itemListRaw = res.list;
                    params.itemList = res.list;
                    console.log('itemList: %o', params.itemList);
                    var limit = params.limit;
                    params.totalPage = Math.ceil(res.count / limit);
                    params.pageList = pageList();
                    params.baseNumber = (page - 1) * limit + 1;
                    $window.scrollTo(params.x, params.y);

                })
                .error(function(err) {
                    console.log('无法查询到相关信息，错误原因：\n%o', err);
                });
        }

        return function(init) {
            if (init) {
                for (var i in init) {
                    if (init.hasOwnProperty(i)) {
                        params[i] = init[i];
                    }
                }
            }

            return {
                params: params,
                pageList: pageList,
                nextNavBar: nextNavBar,
                previousNavBar: previousNavBar,
                queryItems: queryItems,
                active: active
            };
        };
    }])

    .factory('page', ['$window', function($window) {

        // n为当前显示页的页码，从1开始
        // window为angular内置window服务模块
        //function selectPage(n, window, x, y) {
        //    this.baseNumber = (n - 1) * this.limit + 1;
        //    this.curPage = n;
        //    var from = this.limit * (n - 1);
        //    this.dataToShow = this.source.slice(from, from + this.limit);
        //    if (window && window.scrollTo) {
        //        window.scrollTo(x, y);
        //    }
        //}

        function selectPage(window, x, y) {
            return function(n) {
                this.baseNumber = (n - 1) * this.limit + 1;
                this.curPage = n;
                var from = this.limit * (n - 1);
                this.dataToShow = this.source.slice(from, from + this.limit);
                if (window && window.scrollTo) {
                    window.scrollTo(x, y);
                }
                return this.baseNumber;
            }
        }

        function nextPageList() {
            var end = this.pageList.slice(-1);
            var i;
            var len = this.pageList.length;
            if (end < this.pages - this.navBar) {
                for (i = 0; i < len; i++) {
                    this.pageList[i] += this.navBar;
                }
                this.select(this.pageList[0]);
            } else {
                for (i = 0; i < len; i++) {
                    this.pageList[i] = this.pages - len + 1 + i;
                }
                var curPage = this.curPage;
                // 如果当前页码不在当前列表，则将当前页码设为导航条中的首个页码
                if (this.pageList.every(function(e) {return e != curPage;})) {
                    this.select(this.pageList[0]);
                }
            }
        }

        function previousPageList() {
            var first = this.pageList[0];
            var i;
            var len = this.pageList.length;
            if (first - this.navBar > 0) {
                for (i = 0; i < len; i++) {
                    this.pageList[i] -= this.navBar;
                }
                this.select(this.pageList[0]);
            } else {
                for (i = 0; i < len; i++) {
                    this.pageList[i] = i + 1;
                }
                var curPage = this.curPage;
                // 如果当前页码不在当前列表，则将当前页码设为导航条中的首个页码
                if (this.pageList.every(function(e) {return e != curPage;})) {
                    this.select(this.pageList[0]);
                }
            }
        }

        function setActive(n) {
            if (this.curPage == n) {
                return 'active';
            }
        }

        // dataSource为数据源，
        // itemLimit为每页显示条目数，navBarLimit为页码导航中显示的页码数量，
        // x/y分别为设定滚动窗口所到达的坐标
        function initPage(dataSource, itemLimit, navBarLimit, x, y) {
            var source = dataSource ? dataSource : [];
            // 最近的排在最前面
            if (source[0] && source[0].hasOwnProperty('date')) {
                source.sort(function(e1, e2) {
                    var a = (new Date(e1.date)).getTime();
                    var b = (new Date(e2.date)).getTime();
                    if (a < b) {
                        return 1;
                    } else {
                        return a == b ? 0:  -1;
                    }
                });
            }
            var limit = itemLimit ? itemLimit : 100;
            var navBar = navBarLimit ? navBarLimit : 5;
            var dataToShow = source.slice(0, limit);
            var pages = Math.ceil(source.length / limit);
            var pageList = [];
            for (var i = 1; i <= pages && i <= navBar; i++) {
                pageList[i - 1] = i;
            }
            return {
                source: source,
                dataToShow: dataToShow,
                pages: pages,
                pageList: pageList,
                navBar: navBar,
                limit: limit,
                curPage: 1,
                baseNumber: 1,
                active: setActive,
                select: selectPage($window, x, y),
                nextList: nextPageList,
                previousList: previousPageList
            }
        }

        return initPage;
    }]);