var express = require('express');
var router = express.Router();
var path = require('path');

// useful tools
var tool = require('../lib/tool');
// access database
var db = require('../lib/mongodb');
// account authentication
var auth = require('../lib/auth');
// for debug
var debug = require('debug')('user');

/* get token */
router.post('/token', function(req, res) {
    debug('req.body: ' + JSON.stringify(req.body));
    var username = req.body.id;
    if (!username) {
        res.send({status: 'accErr', message: '账号信息不完整'});
        return;
    }

    // 从数据库中查找账号
    db.query('account', {username: username}, function(err, docs) {
        if (err) {
            res.send({status: 'dbReadErr', message: '账号读取错误'});
            return;
        }
        var token = '';
        // 账号不存在，或可用状态为禁用
        if (!docs[0] || !docs[0].enabled) {
            //debug('get token: ');
            // 如果存在相应内置账号
            if (auth.isInternalUser(username)) {
                // 通过用户名（hash字符串）引用内置账号生成token
                token = auth.createToken(username);
                //debug(token);
                res.send({status: 'ok', token: token});
                return;
            }
            debug('get token error');
            res.send({status: 'accErr', message: '用户名或密码错误'});
            return;
        }
        // 用完整账号信息生成token
        token = auth.createToken(docs[0]);
        res.send({status: 'ok', token: token});
    });
});

/* user login */
router.post('/login', function(req, res) {
    //debug('req.body: ' + JSON.stringify(req.body));
    if (!req.body.u && !req.body.p) {
        res.send({status: 'accErr', message: '账号信息不完整'});
        return;
    }
    var account = {username: req.body.u, password: req.body.p};
    debug('account: ' + JSON.stringify(account));
    // account info will be saved in req.session.user
    if (auth.validAccount(account, req.session)) {
        req.session.error = undefined;
        res.send({status: 'ok', message: '登录成功'});
    } else {
        req.session.user = null;
        req.session.error = 'loginErr';
        res.send({status: 'accErr', message: '用户名或密码错误'});
    }
});

/* user logout */
router.all('/logout', function(req, res) {
    delete req.session.user;
    req.session.destroy(function(err) {
        if (err) {
            res.send({status: 'errLogout', message: '内部错误'});
        } else {
            res.send({status: 'ok', message: '成功退出管理面板'});
        }
    });

    //var url = req.body.url || '/main/homepage';
    //res.redirect('/main/homepage');
});

/* management panel */
router.get('/panel', function(req, res) {
    debug('user: ' + JSON.stringify(req.session.user));
    if (!req.session.user) {
        res.redirect('/users/login');
    } else {
        res.render('manageView/panel',
            {rights: req.session.user.rights});
    }
});

/* client type */
router.get('/clientType', function(req, res) {
    //var type = req.session.user ? 'register' : 'anonymous';
    var type = 'anonymous';
    var user = req.session.user;
    if (user) {
        type = user.rights == 'administrator' ? 'administrator' : 'register';
    }
    res.send({status: 'ok', type: type});
});

/* remove doc in mongodb collection */
router.post(/\/remove(\w+)/, function(req, res) {
    if (!req.session.user) {
        res.send({status: 'authErr', message: '非法操作'});
        return;
    }

    var target = req.params[0];
    debug('target:' + target);
    debug('objectId: ' + req.body.objectId);
    var models = {
        Job: 'employer',
        Manpower: 'employee',
        News: 'news',
        Suggestion: 'suggestion'
    };
    if (!models.hasOwnProperty(target) ||
        target == 'Suggestion' && req.session.user.rights != 'administrator') {
        res.send({status: 'targetErr', message: '非法操作对象'});
        return;
    }

    // 生成mongodb的数据条码id
    var objectIds = req.body.objectId || [];
    for (var i = 0, len = objectIds.length; i < len; i++) {
        objectIds[i] = new db.ObjectId(objectIds[i]);
    }

    db.remove(models[target], {_id: {$in: objectIds}}, function(err) {
        if (err) {
            res.send({status: 'dbErr', message: '数据库读写错误'});
        } else {
            res.send({status: 'ok', message: '信息删除成功'});
        }
    });
});

/* web page for list suggestions */
//router.get('/suggestion', function(req, res) {
//    if (!req.session.user) {
//        res.redirect('/main/home');
//    } else {
//        res.sendFile(path.join(__dirname,
//            '../../app/manageView/suggestion.html'));
//    }
//});

/* web page for post community info */
//router.get('/community', function(req, res) {
//    if (!req.session.user) {
//        res.redirect('/main/home');
//    } else {
//        res.sendFile(path.join(__dirname,
//            '../../app/manageView/community.html'));
//    }
//});

/* web page for post news */
//router.get('/news', function(req, res) {
//    if (!req.session.user) {
//        res.redirect('/main/home');
//    } else {
//        res.sendFile(path.join(__dirname, '../../app/mainView/news.html'));
//    }
//});

/* management webPage */
router.get('/auth/:page', function(req, res) {
    if (!req.session.user) {
        res.redirect('/main/home');
        return;
    }

    var page = req.params.page;
    debug('user:' + JSON.stringify(req.session.user));

    var pages = {
        news: 'app/mainView/news.html',
        community: 'app/manageView/community.html',
        suggestion: 'app/manageView/suggestion.html',
        system: 'app/manageView/system.html',
        account: 'app/manageView/account.html',
        carousel: 'app/manageView/carousel.html'
    };
    if (!req.session.user || !pages.hasOwnProperty(page)) {
        res.redirect('/main/home');
    } else {
        res.sendFile(path.join(__dirname, '../..', pages[page]));
    }
});

/* save news submitted by staff */
router.post('/postNews', function(req, res) {
    if (!req.session.user) {
        res.send({status: 'authErr', message: '未授权的非法操作'});
        return;
    }
    //var news = req.body.news;
    var news = tool.trimObject(req.body.news);
    debug('news: ' + JSON.stringify(news));
    if (!news.heading || !news.content) {
        res.send({status: 'paramErr', message: '提供的信息不够完整'});
        return;
    }

    news.date = new Date();

    db.save('news', {heading: news.heading}, news,
        function(err) {
            if (err) {
                res.send({status: 'dbWriteErr', message: '信息保存失败'});
                return;
            }
            res.send({status: 'ok', message: '就业动态新闻保存成功'});
        });
});

/* save community info posted by staff */
router.post('/postCommunity', function(req, res) {
    if (!req.session.user) {
        res.send({status: 'authErr', message: '未授权的非法操作'});
        return;
    }
    //var community = req.body.community;
    var community = tool.trimObject(req.body.community);
    //debug('community: ' + JSON.stringify(community));
    if (!community.name || !community.districtId || !community.address ||
        !community.phone || !community.overview) {
        res.send({status: 'paramErr', message: '提供的信息不够完整'});
        return;
    }

    community.date = new Date();

    db.save('communityInfo', {districtId: community.districtId}, community,
        function(err) {
            if (err) {
                res.send({status: 'dbWriteErr', message: '信息保存失败'});
                return;
            }
            res.send({status: 'ok', message: '就业动态新闻保存成功'});
        });
});

/* get user suggestions */
router.post('/getSuggestion', function(req, res) {
    if (!req.session.user) {
        res.send({status: 'authErr', message: '未授权的非法操作'});
        return;
    }
    // query items limit
    var limit = parseInt(req.body.limit);
    limit = 0 < limit && limit < 500 ? limit : 100;

    var skip = parseInt(req.body.skip);
    skip = skip > 0 ? skip : 0;

    // 保存正常的响应数据
    var response = {status: 'ok'};
    // 用于并发访问的计数器
    var counter = {count: 2, error: false};

    db.count('suggestion', {}, function(err, count) {
        counter.count--;
        if (err) {
            if (counter.error) {
                console.log('db access error');
                return;
            }
            counter.error = true;
            res.send({status: 'dbReadErr', message: '数据库访问错误'});
            return;
        }
        response.count = count;
        if (counter.count == 0) {
            res.send(response);
        }
    });

    db.querySort('suggestion', {}, {date: -1}, function(err, docs) {
        counter.count--;
        if (err) {
            if (counter.error) {
                console.log('db access error');
                return;
            }
            counter.error = true;
            res.send({status: 'dbReadErr', message: '数据库访问错误'});
            return;
        }
        response.list = docs;
        if (counter.count == 0) {
            res.send(response);
        }
    }, '', limit, skip);
});

/* count docs in certain collection */
router.post('/counter', function(req, res) {
    if (!req.session.user || req.session.user.rights != 'administrator') {
        res.send({status: 'authErr', message: '未授权的非法操作'});
        return;
    }

    var collect = req.body.collect;
    var condition = req.body.condition;
    condition = condition || {};

    if (condition.hasOwnProperty('date')) {
        var date = condition.date;
        condition.date = {};
        if (date.hasOwnProperty('lt')) {
            condition.date.$lt = new Date(parseInt(date.lt));
        }
        if (date.hasOwnProperty('gt')) {
            condition.date.$gt = new Date(parseInt(date.gt));
        }
    }

    var regExp = req.body.regExp;
    for (var i in regExp) {
        if (!regExp.hasOwnProperty(i)) {
            continue;
        }
        condition[i] = new RegExp(regExp[i], 'i');
    }
    debug('condition: ' + JSON.stringify(condition));

    db.count(collect, condition, function(err, data) {
        if (err) {
            res.send({status: 'countErr', message: '统计数据条目失败'});
            return;
        }
        res.send({status: 'ok', count: data});
    });
});

/* get accounts */
router.get('/getAccount', function(req, res) {
    if (!req.session.user || req.session.user.rights != 'administrator') {
        res.send({status: 'authErr', message: '未授权的非法操作'});
        return;
    }

    db.query('account', {}, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库查询失败'});
            return;
        }
        //for (var i = 0, len = docs.length; i < len; i++) {
        //    docs[i].password = '';
        //}
        res.send({status: 'ok', accounts: docs});
    }, '-username -password');
});

/* add or modify account */
router.post('/modifyAccount', function(req, res) {
    if (!req.session.user || req.session.user.rights != 'administrator') {
        res.send({status: 'authErr', message: '未授权的非法操作'});
        return;
    }

    var acc = tool.trimObject(req.body.account);
    if (!acc.username) {
        res.send({status: 'emptyName', message: '用户名不能为空'});
        return;
    }
    var account = {name: acc.username, username: auth.hash(acc.username)};
    // when creating new account
    if (!acc.originalName && (!acc.password || !acc.rights)) {
        res.send({status: 'emptyName', message: '用户密码和权限必须设置'});
        return;
    }
    if (!acc.originalName) {
        acc.originalName = account.name;
    }
    if (acc.rights) {
        account.rights = acc.rights;
    }
    if (acc.password ) {
        if (acc.password.length < 6) {
            res.send({status: 'errPassword', message: '密码设置太简单'});
        }
        account.password = acc.password;
    }
    if (acc.description) {
        account.description = acc.description;
    }
    if (acc.hasOwnProperty('enabled')) {
        account.enabled = acc.enabled;
    }

    db.save('account', {name: acc.originalName}, account,
        function(err) {
            if (err) {
                console.log('Db error: ' + JSON.stringify(err));
                res.send({status: 'dbErr', message: '数据库查询失败'});
                return;
            }
            res.send({status: 'ok'});
        });
});

/* delete account */
router.post('/deleteAccount', function(req, res) {
    if (!req.session.user || req.session.user.rights != 'administrator') {
        res.send({status: 'authErr', message: '未授权的非法操作'});
        return;
    }
    debug('req.session.user: ' + JSON.stringify(req.session.user));

    var username = req.body.name;
    if (!username) {
        res.send({status: 'emptyName', message: '用户名不能为空'});
        return;
    }

    if (req.session.user.name == username) {
        res.send({status: 'curUserErr', message: '无法删除当前登录用户'});
        return;
    }

    db.remove('account', {name: username}, function(err) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库操作失败'});
            return;
        }
        debug('respond ok');
        res.send({status: 'ok'});
    })
});

/* check username/idNumber or organization name/code */
router.post('/identification', function(req, res) {
    var collect = req.body.collect;
    if (!collect && !req.body.name && !req.body.code) {
        send({status: 'paramsErr', message: '验证信息不完整'});
        return;
    }
    var condition = {};
    if (collect == 'person') {
        condition.username = req.body.name;
        condition.idNumber = req.body.code.toString().toUpperCase();
    } else if (collect == 'organization') {
        condition.name = req.body.name;
        condition.code = req.body.code.toString().toUpperCase();
    } else {
        send({status: 'paramsErr', message: '验证信息有错误'});
        return;
    }
    // for floating population
    if (collect == 'person' && req.body.resident == 'no') {
        req.session.identity = condition;
        res.send({status: 'ok', message: 'floating population'});
        return;
    }

    db.query(collect, condition, function(err, docs) {
        if (err) {
            console.log('Db error: ' + JSON.stringify(err));
            res.send({status: 'dbErr', message: '数据库操作失败'});
            return;
        }
        if (docs.length) {
            req.session.identity = condition;
            res.send({status: 'ok'});
        } else {
            res.send({status: 'fail'});
        }
    });
});
module.exports = router;
