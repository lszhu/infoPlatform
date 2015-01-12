'use strict';

angular.module('myApp.service', [])

    .factory('logout', ['$http', '$location',
        function($http, $location) {

            return function() {
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

    .factory('formatInfo', [function() {

        function makeReference(info) {
            if (!info) {
                return '';
            }
            var ref = '';
            if (info.hasOwnProperty('date')) {
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

    // not used
    //.factory('job', ['$http', function($http) {
    //
    //    function getJob(condition) {
    //        var job = {};
    //        $http.post('/searchJob', {condition: condition})
    //            .success(function(res) {
    //                if (res.status == 'ok') {
    //                    var tmp = res.jobList;
    //                    tmp.sort(function(a, b) {
    //                        if (a.date == b.date) {
    //                            return 0;
    //                        } else {
    //                            return a.date < b.date ? 1 : -1;
    //                        }
    //                    });
    //                    job.list = tmp;
    //                }
    //            })
    //            .error(function(err) {
    //                console.log('无法获取招聘信息，错误原因：%o', err);
    //                job.list = [];
    //            });
    //        return job;
    //    }
    //
    //    return getJob;
    //}])

    .factory('pagination', ['$window', '$http', function($window, $http) {

        // 分页相关参数
        var params = {
            target: '',             // 查询的目标路径
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
            if (!parseInt(page)) {
                page = 1;
            }

            // 设置当前页面
            params.curPage = page;

            // 设置查询条件
            var cond = params.condition;
            cond.limit = params.limit;
            cond.skip = (page - 1) * params.limit;
            if (params.districtId) {
                cond.districtId = params.districtId;
            }

            if (!params.target) {
                console.log('Please initiate data source path');
                return;
            }
            //console.log('condition: %o', cond);
            // 查询数据
            $http.post(params.target, cond)
                .success(function(res) {
                    if (res.status != 'ok') {
                        console.log(res.message);
                        return;
                    }
                    params.itemListRaw = res.list;
                    params.itemList = res.list;
                    console.log('itemList.length: %o', params.itemList.length);
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

    /*.factory('page', ['$window', function($window) {

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
    }])
*/
    .factory('management', ['$http', '$location',
        function($http, $location) {
            var params = {
                register: '',
                removalList: [],
                selectedAll: false,
                userTypeUrl: '/users/clientType',
                logoutUrl: '/users/logout',
                panelUrl: '/users/panel',
                removeUrl: ''
            };

            function gotoPanel() {
                $location.path(params.panelUrl);
            }

            function logout(target) {
                $http.get(params.logoutUrl)
                    .success(function(res) {
                        console.log(res.message);
                        $location.search('management', null);
                        // 如果target存在，则转到对应页面
                        target && $location.path(target);
                        //$location.replace();
                        location.reload();
                    })
                    .error(function(err) {
                        alert('系统出现异常：\n' + err);
                    });
            }

            function reverse(index) {
                params.removalList[index] = !params.removalList[index];
                //console.log('reversed index: ' + index);
            }

            function selectAll(itemList) {
                params.selectedAll = !params.selectedAll;
                var len = itemList.length;
                for (var i = 0; i < len; i++) {
                    params.removalList[i] = params.selectedAll;
                }
                //console.log($scope.removalList);
            }

            // 将选中条目的mongodb存储_id号抽出，作为删除的条件
            function getRemovals(itemList) {
                //var items = $scope.page.params.itemList;
                var ids = [];
                var selList = params.removalList;
                for (var i = 0, len = itemList.length; i < len; i++) {
                    if (selList[i]) {
                        ids.push(itemList[i]._id);
                    }
                }
                return ids;
            }

            // 由item中的id列表过滤itemList和itemListRaw中的数据
            function filterItems(idList, itemList, itemListRaw) {
                if (!idList || !idList.length) {
                    return;
                }
                //console.log('idList: %o', idList);
                // 注意此处没有直接用过滤函数，而是在原对象上直接操作
                var i, j, test;
                var len = itemList ? itemList.length : 0;
                if (itemList && len) {
                    for (i = 0, j = 0; i < len; i++) {
                        test = idList.some(function(e) {
                            return e == itemList[i]._id});
                        //!test || console.log('_id: ' + itemList[i]._id);
                        if (!test) {
                            itemList[j] = itemList[i];
                            j++;
                        }
                    }
                    itemList.splice(j);
                }
                len = itemListRaw ? itemListRaw.length : 0;
                if (itemListRaw && len) {
                    for (i = 0, j = 0; i < len; i++) {
                        test = idList.some(function(e) {
                            return e == itemListRaw[i]._id});
                        if (!test) {
                            itemListRaw[j] = itemListRaw[i];
                            j++;
                        }
                    }
                    itemListRaw.splice(j);
                }
            }

            // 删除所有选中条目
            function removeItems(item, itemList, itemListRaw) {
                var idList = item ? [item._id] : getRemovals(itemList);

                if (!idList.length || !confirm('确实要删除这些信息吗')) {
                    return;
                }

                if (!params.removeUrl) {
                    console.log('Do not support removal');
                    return;
                }
                console.log('removing');
                $http.post(params.removeUrl, {objectId: idList})
                    .success(function(res) {
                        if (res.status == 'ok') {
                            console.log('removed ok');
                            params.selectedAll = false;
                            params.removalList = [];
                            filterItems(idList, itemList, itemListRaw);
                            //location.reload();
                        }
                        console.log(res.message);
                    })
                    .error(function(err) {
                        console.log('error: %o', err);
                    });
            }

            function initiate(init) {
                if (init) {
                    for (var i in init) {
                        if (init.hasOwnProperty(i)) {
                            params[i] = init[i];
                        }
                    }
                }
                // 管理模式设置
                var manage = $location.search().hasOwnProperty('management');
                //console.log('$scope.manage:' + JSON.stringify(manage));
                if (manage) {
                    $http.get(params.userTypeUrl)
                        .success(function(res) {
                            console.log(res.type);
                            if (res.type != 'anonymous') {
                                params.register = res.type;
                            }
                            //if (res.type == 'register') {
                            //    params.register = true;
                            //} else {
                            //    $location.search('management', null);
                            //    params.register = false;
                            //}
                        });
                }
                return {
                    params: params,
                    gotoPanel:  gotoPanel,
                    logout: logout,
                    reverse: reverse,
                    selectAll: selectAll,
                    //removeItemList: removeItemList,
                    getRemovals: getRemovals,
                    removeItems: removeItems
                    //removeItem: removeItem
                };
            }

            return initiate;
    }])

    .factory('identify', ['$http', function($http) {

        // 校验组织机构代码的合法性，代码共9位，最后一位是校验码
        function validCode(code) {
            if (!code || code.length !== 9) {
                return false;
            }
            code = code.toString().toUpperCase();
            var alphaNum = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            var weight = [3, 7, 9, 10, 5, 8, 4, 2];
            var sum = 0;
            var n;
            for (var i = 0; i < 8; i++) {
                n = alphaNum.search(code[i]);
                if (n == -1) {
                    return false;
                }
                sum += n * weight[i];
            }
            sum = 11 - sum % 11;
            if (sum == 10) {
                sum = 'X';
            } else if (sum == 11) {
                sum = '0';
            }
            return sum == code[8];
        }

        // 验证身份证号的合法性，共18位，最后一位是校验码
        function validIdNumber(idNumber) {
            idNumber = idNumber ? idNumber.toString() : '';
            if (idNumber.length != 18 || 12 < idNumber.slice(10, 12) ||
                idNumber.slice(6, 8) < 19 || 20 < idNumber.slice(6, 8)) {
                return false;
            }
            var weights = [
                '7', '9', '10', '5', '8', '4', '2', '1', '6',
                '3', '7', '9', '10', '5', '8', '4', '2', '1'
            ];
            var sum = 0;
            for (var i = 0; i < 17; i++) {
                var digit = idNumber.charAt(i);
                if (isNaN(Number(digit))) {
                    return false;
                }
                sum += digit * weights[i];
            }
            sum = (12 - sum % 11) % 11;
            return sum == 10 && idNumber.charAt(17).toLowerCase() == 'x' ||
                sum < 10 && sum == idNumber.charAt(17);
        }

        // 验证姓名/身份证号或单位名称/组织机构代码是否匹配
        // param含有collect、name及code三个属性
        function check(param, callback) {
            if (param.collect == 'person') {
                if (!validIdNumber(param.code)) {
                    alert('您输入的身份证号有误，请重新输入');
                    return;
                }
            } else if (param.collect == 'organization') {
                if (!validCode(param.code)) {
                    alert('您输入的组织机构代码有误，请重新输入');
                    return;
                }
            } else {
                console.log('错误的collect名称');
                return;
            }
            $http.post('users/identification', param)
                .success(function(res) {
                    if (res.status == 'ok') {
                        callback();
                        return;
                    }
                    if (param.collect == 'person') {
                        alert('您输入的姓名/身份证号不匹配，或者您的信息未在' +
                            '区县就业局登记，请到户口所在地的乡镇/社区登记。');
                    } else if (param.collect == 'organization') {
                        alert('您输入的单位名称/组织机构代码不匹配，请携带' +
                            '有关证件到' + '区县人社局下属就业局登记。');
                    }
                })
                .error(function(err) {
                    alert('系统出现异常：\n' + err);
                });
        }

        return {
            validCode: validCode,
            validIdNumber: validIdNumber,
            check: check
        };
    }]);