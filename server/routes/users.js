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
            // 存在相应内置账号
            if (auth.isInternalUser(username)) {
                // 通过用户名（hash字符串）引用内置账号生成token
                token = auth.createToken(username);
                res.send({status: 'ok', token: token});
                return;
            }
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
    req.session.user = null;
    res.send({status: 'ok', message: '成功退出管理面板'});
    //var url = req.body.url || '/main/homepage';
    //res.redirect(url);
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
    var type = req.session.user ? 'register' : 'anonymous';
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
    if (!models.hasOwnProperty(target)) {
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
    var page = req.params.page;
    debug('target:' + page);

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

});

module.exports = router;
