var express = require('express');
var router = express.Router();

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

module.exports = router;
