var express = require('express');
var router = express.Router();
var path = require('path');

// for debug
var debug = require('debug')('route');

// account authentication
var auth = require('../lib/auth');
// access database
var db = require('../lib/mongodb');
// miscellaneous tools
var tool = require('../lib/tool');
// get district name and id
var district = require('../lib/districtId');
// set default districtId;
//var districtId = '431103';
var districtId = require('../config').districtId;

/* shallow copy of the object and trim the leading&trailing spaces */
function trimObject(obj) {
    var trimmed = {};
    for (var a in obj) {
        if (!obj.hasOwnProperty(a) || (typeof a) != 'string') {
            continue;
        }
        trimmed[a] = obj[a].toString().trim();
    }
    return trimmed;
}

// valid ID number
function validIdNumber(idNumber) {
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

/* get district info */
router.get('/district', function(req, res) {
    res.send({status: 'ok', district: district, districtId: districtId});
});

/* get policy content */
router.get('/getPolicyMsg/:id', function(req, res) {
    res.send({
        status: 'ok',
        content: '<p>AngularJS 是 Google 开源出来的一套 js 工具。' +
        '下面简称其为 ng 。这里只说它是“工具”，没说它是完整的“框架”，' +
        '是因为它并不是定位于去完成一套框架要做的事。更重要的，' +
        '下面简称其为 ng 。这里只说它是“工具”，没说它是完整的“框架”，' +
        '是因为它并不是定位于去完成一套框架要做的事。更重要的，' +
        '下面简称其为 ng 。这里只说它是“工具”，没说它是完整的“框架”，' +
        '是因为它并不是定位于去完成一套框架要做的事。更重要的，' +
        '下面简称其为 ng 。这里只说它是“工具”，没说它是完整的“框架”，' +
        '是因为它并不是定位于去完成一套框架要做的事。更重要的，' +
        '下面简称其为 ng 。这里只说它是“工具”，没说它是完整的“框架”，' +
        '是因为它并不是定位于去完成一套框架要做的事。更重要的，' +
        '是它给我们揭示了一种新的应用组织与开发方式。</p>' + req.params.id
    });
});

/* save message posted by employer */
router.post('/postEmployer', function(req, res) {
    var employer = trimObject(req.body.employer);
    debug('employer: ' + JSON.stringify(employer));
    if (!employer.name || !employer.code || !employer.phone) {
        res.send({status: 'paramErr', message: '提供的招聘信息不够完整'});
        return;
    }

    employer.date = new Date();

    // be sure no organization code will be 0
    db.save('employer', {code: '0'}, employer, function(err) {
        if (err) {
            res.send({status: 'dbWriteErr', message: '招聘信息保存失败'});
            return;
        }
        res.send({status: 'ok', message: '招聘信息保存成功'});
    });
});

/* save message posted by job hunter */
router.post('/postEmployee', function(req, res) {
    var employee = trimObject(req.body.employee);
    debug('employee: ' + JSON.stringify(employee));
    if (!employee.name || !employee.idNumber || !employee.phone) {
        res.send({status: 'paramErr', message: '提供的求职信息不够完整'});
        return;
    }
    if (!validIdNumber(employee.idNumber)) {
        res.send({status: 'paramErr', message: '提供的身份证号有误'});
        return;
    }

    employee.date = new Date();

    db.save('employee', {idNumber: employee.idNumber}, employee, function(err) {
        if (err) {
            res.send({status: 'dbWriteErr', message: '求职信息保存失败'});
            return;
        }
        res.send({status: 'ok', message: '求职信息保存成功'});
    });
});

/* save organization introduction posted by organization */
router.post('/postOrgInfo', function(req, res) {
    var employer = trimObject(req.body.employer);
    debug('organization info: ' + JSON.stringify(employer));
    if (!employer.name || !employer.code || !employer.address ||
        !employer.phone || !employer.overview) {
        res.send({status: 'paramErr', message: '提供的招聘信息不够完整'});
        return;
    }

    employer.date = new Date();

    db.save('orgInfo', {code: employer.code}, employer, function(err) {
        if (err) {
            res.send({status: 'dbWriteErr', message: '招聘信息保存失败'});
            return;
        }
        res.send({status: 'ok', message: '招聘信息保存成功'});
    });
});

/* save suggestion submitted by adviser */
router.post('/postSuggestion', function(req, res) {
    var suggestion = trimObject(req.body.suggestion);
    debug('suggestion: ' + JSON.stringify(suggestion));
    if (!suggestion.name || !suggestion.idNumber || !suggestion.phone) {
        res.send({status: 'paramErr', message: '提供的个人信息不够完整'});
        return;
    }

    employer.date = new Date();

    db.save('suggestion', {idNumber: suggestion.idNumber}, suggestion,
        function(err) {
            if (err) {
                res.send({status: 'dbWriteErr', message: '建议信息保存失败'});
                return;
            }
            res.send({status: 'ok', message: '投诉建议信息保存成功'});
        });
});

/* get job info posted by employer */
router.post('/searchJob', function(req, res) {
    // query items limit
    var limit = 2000;
    var now = new Date();
    // half a year before
    var date = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    var condition = {date: {$gt: date}};
    if (req.body.name) {
        condition.name = new RegExp(req.body.name);
    }
    var education = ['小学及以下', '初中', '高中',
        '中专中技', '大专', '本科及以上', '', null];
    if (req.body.education && parseInt(req.body.education)) {
        condition.education = {$in: education.slice(req.body.education)};
    }
    if (req.body.position) {
        condition.position = new RegExp(req.body.position);
    }
    var salary = tool.salarySpan(req.body.salary);
    if (salary) {
        condition.salary = salary;
    }
    if (req.body.districtId) {
        condition.districtId = new RegExp('^' + req.body.districtId);
    }
    debug('search job condition: ' + JSON.stringify(condition));

    db.query('employer', condition, function(err, docs) {
        if (err) {
            res.send({status: 'dbReadErr', message: '数据库访问错误'});
            return;
        }
        res.send({status: 'ok', jobList: docs});
    }, undefined, limit);
});

/* search for organization info */
router.post('/searchOrganization', function(req, res) {
    // query items limit
    var limit = 2000;
    var condition = {};
    if (req.body.name) {
        condition.name = new RegExp(req.body.name);
    }
    if (req.body.address) {
        condition.address = new RegExp(req.body.address);
    }
    if (req.body.type) {
        condition.type = req.body.type;
    }
    if (req.body.scale) {
        condition.staffs = tool.orgScale(req.body.scale);
    }
    if (req.body.districtId) {
        condition.districtId = new RegExp('^' + req.body.districtId);
    }
    debug('searchOrg condition: ' + JSON.stringify(condition));

    db.query('organization', condition, function(err, docs) {
        if (err) {
            console.log('db access error');
            res.send({status: 'dbReadErr', message: 单位信息读取失败});
            return;
        }
        docs.sort(function(a, b) {
            if (a.staffs < b.staffs) {
                return 1;
            } else if (a.staffs == b.staffs) {
                return 0;
            } else {
                return -1;
            }
        });
        for (var i = 0, len = docs.length; i < len; i++) {
            docs[i].staffs = tool.blurStaffs(docs[i].staffs);
            if (!docs[i].address) {
                docs[i] = tool.getAddress(docs[i]);
            }
        }
        debug('organization list length: ' + docs.length);
        res.send({status: 'ok', list: docs});
    }, 'name phone address type economicType jobForm staffs', limit);
});

/* search for manpower info */
router.post('/searchManpower', function(req, res) {
    var condition = {};
    //if (req.body.gender) {
    //    condition.gender = req.body.gender;
    //}
    var salary = tool.salarySpan(req.body.salary);
    if (salary) {
        condition.salary = salary;
    }
    var education = ['小学及以下', '初中', '高中',
        '中专中技', '大专', '本科及以上', '', null];
    if (req.body.education && parseInt(req.body.education)) {
        condition.education = {$in: education.slice(req.body.education)};
    }
    if (req.body.experience) {
        condition.experience = new RegExp(req.body.experience);
    }
    if (req.body.districtId) {
        condition.districtId = new RegExp('^' + req.body.districtId);
    }

    debug('search manpower condition: ' + JSON.stringify(condition));
    debug('ageFrom: ' + req.body.ageFrom);
    debug('ageTo: ' + req.body.ageTo);

    // query items limit
    var limit = 5000;
    // response items limit
    var resLimit = 2000;
    db.query('employee', condition, function(err, docs) {
        if (err) {
            console.log('db access error');
            res.send({status: 'dbReadErr', message: 求职信息读取失败});
            return;
        }
        var data = [];
        var gender;
        for (var i = 0, len = docs.length; i < len; i++) {
            gender = tool.getGender(docs[i]);
            if (req.body.gender && req.body.gender != gender) {
                continue;
            }
            if (tool.validAge(req.body.ageFrom, req.body.ageTo,
                    docs[i].idNumber)) {
                docs[i].age = tool.blurAge(tool.getAge(docs[i]));
                docs[i].gender = tool.getGender(docs[i]);
                docs[i].idNumber = '';
                data.push(docs[i]);
            }
        }
        data = data.slice(0, resLimit);
        res.send({status: 'ok', list: data});
    }, '', limit);
});

/* search for worker info */
router.post('/searchWorker', function(req, res) {
    var condition = {};
    if (req.body.gender) {
        condition.gender = req.body.gender;
    }
    if (req.body.employment) {
        condition.employment = req.body.employment;
    }
    var education = ['小学及以下', '初中', '高中', '中专中技',
        '中专', '大专', '本科及以上', '研究生', '硕士', '博士', '', null];
    if (req.body.education && parseInt(req.body.education)) {
        condition.education = {$in: education.slice(req.body.education)};
    }
    if (req.body.experience) {
        condition.experience = new RegExp(req.experience);
    }
    if (req.body.districtId) {
        condition.districtId = new RegExp('^' + req.body.districtId);
    }
    //var salary = tool.salarySpan(req.salary);
    //if (salary) {
    //    condition.salary = salary;
    //}
    debug('search worker condition: ' + JSON.stringify(condition));

    debug('ageFrom: ' + req.body.ageFrom);
    debug('ageTo: ' + req.body.ageTo);

    // query items limit
    var limit = 5000;
    // response items limit
    var resLimit = 2000;
    db.query('person', condition, function(err, docs) {
        if (err) {
            console.log('db access error');
            res.send({status: 'dbReadErr', message: 人力资源信息读取失败});
            return;
        }
        var data = [];
        for (var i = 0, len = docs.length; i < len; i++) {
            if (tool.validAge(req.body.ageFrom, req.body.ageTo,
                    docs[i].idNumber)) {
                docs[i] = tool.filterWorkerMsg(docs[i]);
                //debug('blurred worker msg: ' + docs[i]);
                data.push(docs[i]);
            }
        }
        data = data.slice(0, resLimit);
        debug('searched worker data length: ' + docs.length);
        res.send({status: 'ok', list: data});
    }, '', limit);
});

/* GET clause page. */
//router.get('/etc/clause', function(req, res) {
//  res.sendFile(path.join(__dirname, '../../app/etcView/clause.html'));
//});

module.exports = router;
