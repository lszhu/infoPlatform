// 从配置文件读取内置账号
var builtinAccount = require('../config').builtinAccount;

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');

// 临时保存登录验证用的数据，以用户名（hash后）的前八位为属性值
var accountToken = {};

// 加密函数，采用sha1方式hash数据
function hash(data) {
    var d = data || '';
    var sha1 = crypto.createHash('sha1');
    sha1.update(d.toString());
    return sha1.digest('hex');
}
//console.log(hash('abcd'));

// 验证是否为内置账号名
function isInternalUser(username) {
    return username == hash(builtinAccount.username);
}

// 复制完整账号信息（浅拷贝）
function copyAccount(acc) {
    var newAcc = {};
    for (var i in acc) {
        if (acc.hasOwnProperty(i)) {
            newAcc[i] = acc[i];
        }
    }
    return newAcc;
}

// 创建验证用的token，并将待验证信息放入特定列表
function createToken(account) {
    var t = Date.now().toString();
    var r = Math.random() * 1E16;
    var token = hash(t + r);
    //console.log('typeof token: ' + typeof token);
    //console.log('token: ' + token);

    // 用于内置账号情况
    if ( typeof account == 'string') {
        if (!isInternalUser(account)) {
            return '';
        }
        account = copyAccount(builtinAccount);
        account.username = hash(builtinAccount.username);
        account.password = hash(builtinAccount.password);
    }
    // 将账号token信息加入accountToken变量中
    accountToken[account.username.slice(0, 8)] = {
        username: account.username,
        password: hash(account.username + token),
        info: account
    };

    return token;
}
//createToken('admin');
//console.log('accountToken: ' + JSON.stringify(accountToken));

// 验证账号信息（hash值）
function validAccount(account, accountStore) {
    if (!account.username) {
        return false;
    }
    var name = account.username.slice(0, 8);
    var acc = accountToken[name];
    //console.log('acc: ' + JSON.stringify(acc));
    if (!acc) {
        return false;
    }
    accountToken[name] = null;
    // 账号信息（username/password已被hash）被保存（在user属性中）以备用
    if (accountStore && typeof accountStore == 'object') {
        accountStore.user = acc.info;
    }
    //console.log('account: ' + JSON.stringify(account));
    return account.username == acc.username &&
            account.password == acc.password;
}
//var token = createToken('admin');
//console.log('accountToken: ' + JSON.stringify(accountToken));
//var admin = {username: hash('admin'), password: hash(hash('admin') + token)};
//console.log('admin acc: ' + JSON.stringify(admin));
//console.log('validAccount:' + validAccount(admin));

// 对两个参数代表的账号进行比对，如果一致，则返回真值
function auth(acc, stdAcc) {
    // 与系统中的账号进行比对
    if (stdAcc) {
        return acc && stdAcc.enabled &&
            acc.username == stdAcc.username &&
            acc.password == stdAcc.password;
    }
    // 与内置账号进行比对
    return acc && builtinAccount.enabled &&
        acc.username == builtinAccount.username &&
        acc.password == builtinAccount.password;
}

// 检测acc对应账号的权限是否满足rights对应的权限，是则返回真值
function testRights(acc, rights) {
    var permission = {
        readonly: 1,
        readPlus: 2,
        readWrite: 3,
        administrator: 4
    };
    var accRights = permission[acc.rights];
    accRights = accRights ? accRights : 0;
    var stdRights = permission[rights];
    stdRights = stdRights ? stdRights : 0;
    return accRights >= stdRights;
}

module.exports = {
    auth: auth,
    testRights: testRights,
    hash: hash,
    isInternalUser: isInternalUser,
    createToken: createToken,
    validAccount: validAccount
};