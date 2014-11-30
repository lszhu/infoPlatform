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
        if (!obj.hasOwnProperty(a)) {
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

/* get job info posted by employer */
router.get('/jobService', function(req, res) {
    // query items limit
    var limit = 100;
    var now = new Date();
    // half a year before
    var date = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    db.query('employer', {date: {$gt: date}}, function(err, docs) {
        if (err) {
            res.send({status: 'dbReadErr', message: '数据库访问错误'});
            return;
        }
        res.send({status: 'ok', jobList: docs});
    }, undefined, limit);
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

    employer.date = new Date();

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

/* search for organization info */
router.post('/searchOrganization', function(req, res) {
    var condition = {};
    if (req.name) {
        condition.name = new RegExp(req.name);
    }
    if (req.education) {
        condition.education = req.education;
    }
    if (req.experience) {
        condition.experience = new RegExp(req.experience);
    }
    var salary = tool.salarySpan(req.salary);
    if (salary) {
        condition.salary = salary;
    }

    // query items limit
    var limit = 5000;
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
        }
        debug('organization list length: ' + docs.length);
        res.send({status: 'ok', list: docs});
    }, 'name phone address type economicType jobForm staffs', limit);
});

/* search for manpower info */
router.post('/searchManpower', function(req, res) {
    var condition = {};
    if (req.sex) {
        condition.sex = req.sex;
    }
    if (req.education) {
        condition.education = req.education;
    }
    if (req.experience) {
        condition.experience = new RegExp(req.experience);
    }
    var salary = tool.salarySpan(req.salary);
    if (salary) {
        condition.salary = salary;
    }

    // query items limit
    var limit = 5000;
    db.query('employee', condition, function(err, docs) {
        if (err) {
            console.log('db access error');
            res.send({status: 'dbReadErr', message: 求职信息读取失败});
            return;
        }
        var data = [];
        for (var i = 0, len = docs.length; i < len; i++) {
            if (tool.validAge(req.ageFrom, req.ageTo, docs[i].idNumber)) {
                docs[i].age = tool.blurAge(tool.getAge(docs[i]));
                docs[i].gender = tool.getGender(docs[i]);
                docs[i].idNumber = '';
                data.push(docs[i]);
            }
        }
        res.send({status: 'ok', list: data});
    }, '', limit);
});

/* search for worker info */
router.post('/searchWorker', function(req, res) {
    var condition = {};
    if (req.sex) {
        condition.sex = req.sex;
    }
    if (req.education) {
        condition.education = req.education;
    }
    if (req.experience) {
        condition.experience = new RegExp(req.experience);
    }
    var salary = tool.salarySpan(req.salary);
    if (salary) {
        condition.salary = salary;
    }
    debug('search worker condition: ' + JSON.stringify(condition));

    // query items limit
    var limit = 5000;
    db.query('person', condition, function(err, docs) {
        if (err) {
            console.log('db access error');
            res.send({status: 'dbReadErr', message: 人力资源信息读取失败});
            return;
        }
        var data = [];
        for (var i = 0, len = docs.length; i < len; i++) {
            if (tool.validAge(req.ageFrom, req.ageTo, docs[i].idNumber)) {
                docs[i] = tool.filterWorkerMsg(docs[i]);
                debug('blurred worker msg: ' + docs[i]);
                data.push(docs[i]);
            }
        }
        debug('searched worker data length: ' + docs.length);
        res.send({status: 'ok', list: data});
    }, '', limit);
});

/* GET clause page. */
//router.get('/etc/clause', function(req, res) {
//  res.sendFile(path.join(__dirname, '../../app/etcView/clause.html'));
//});

module.exports = router;
