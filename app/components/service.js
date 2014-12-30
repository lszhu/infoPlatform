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

    .factory('pagination', function() {
        function pageList(totalPage, curPage, pageNav) {
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
            return pages;
        }

        function nextNavBar(totalPage, curPageList, pageNav) {
            if (curPageList.length < pageNav) {
                return curPageList;
            }
            console.log(totalPage, curPageList, pageNav);
            var total = [];
            for (var i = 1; i <= totalPage; i++) {
                total.push(i);
            }
            var last = curPageList[pageNav - 1];
            console.log('last: ' + last);
            if (last <= totalPage - pageNav) {
                return total.slice(last, last + pageNav);
            } else {
                return total.slice(totalPage - pageNav)
            }
        }

        function previousNavBar(totalPage, curPageList, pageNav) {
            if (curPageList.length < pageNav) {
                return curPageList;
            }

            var total = [];
            for (var i = 1; i <= totalPage; i++) {
                total.push(i);
            }
            var first = curPageList[0];
            if (first > pageNav) {
                return total.slice(first - pageNav -1, first - 1);
            } else {
                return total.slice(0, pageNav);
            }
        }

        function active(p1, p2) {
            if (p1 == p2) {
                return 'active';
            }
            return '';
        }

        return {
            pageList: pageList,
            nextNavBar: nextNavBar,
            previousNavBar: previousNavBar,
            active: active
        }
    })

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