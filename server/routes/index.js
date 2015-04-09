var express = require('express');
var router = express.Router();
var path = require('path');
// used to parse upload file (multipart/form-data)
var multiparty = require('multiparty');

// for debug
var debug = require('debug')('route');

// access database
var db = require('../lib/mongodb');
// miscellaneous tools
var tool = require('../lib/tool');
// get district name and id
var district = require('../lib/districtId');
// load configuration
var configuration = require('../config');
// set default districtId;
var districtId = configuration.districtId;

/* get district info */
router.get('/district', function(req, res) {
    res.send({status: 'ok', district: district, districtId: districtId});
});

/* get auxiliary information showing on home page */
router.get('/auxInfo', function(req, res) {
    var auxInfo = configuration.auxiliaryInfo;
    res.send({status: 'ok', info: auxInfo});
});

/* get organization picture */
router.get('/picture/:id', function(req, res) {
    var collect = 'orgInfo';
    if (req.query.hasOwnProperty('community')) {
        collect = 'communityInfo';
    }
    var date = new Date(+req.params.id);
    debug('pictureId: ' + req.params.id);
    if (date == 'Invalid Date') {
        var pic = path.join(__dirname, '../../app/images/default.jpg');
        res.sendFile(pic);
        return;
    }
    debug('date: ' + JSON.stringify(date));

    db.query(collect, {date: date}, function(err, docs) {
        if (err) {
            res.send({status: 'dbErr', message: '访问数据库系统出现异常'});
            return;
        }
        if (!docs.length) {
            res.send({status: 'noData', message: '图片不存在'});
            return;
        }
        var imgData = tool.base64ImgData(docs[0].picture);
        var imgType = tool.base64ImgType(docs[0].picture);
        //debug('image type: ' + imgType);
        res.type(imgType);
        res.send(imgData);
    });
});

/* get policy heading or content */
//router.post('/getPolicyMsg', function(req, res) {
//    // query items limit
//    var limit = parseInt(req.body.limit);
//    limit = 0 < limit && limit < 500 ? limit : 100;
//
//    var skip = parseInt(req.body.skip);
//    skip = skip > 0 ? skip : 0;
//
//    // 指定类型为政策法规
//    var condition = {type: 'policy'};
//    var fields = 'heading date';
//
//    if (req.body.infoId) {
//        condition._id = db.ObjectId(req.body.infoId);
//        fields = '';
//    }
//    debug('condition: ' + JSON.stringify(condition));
//    // 保存正常的响应数据
//    var response = {status: 'ok'};
//    // 用于并发访问的计数器
//    var counter = {count: 2, error: false};
//
//    db.count('news', condition, function(err, count) {
//        counter.count--;
//        if (err) {
//            if (counter.error) {
//                console.log('db access error');
//                return;
//            }
//            counter.error = true;
//            res.send({status: 'dbReadErr', message: '数据库访问错误'});
//            return;
//        }
//        response.count = count;
//        if (counter.count == 0) {
//            res.send(response);
//        }
//    });
//
//    db.querySort('news', condition, {date: -1}, function(err, docs) {
//        counter.count--;
//        if (err) {
//            if (counter.error) {
//                console.log('db access error');
//                return;
//            }
//            counter.error = true;
//            res.send({status: 'dbReadErr', message: '数据库访问错误'});
//            return;
//        }
//        debug('docs length: ' + docs.length);
//        response.list = docs;
//        if (counter.count == 0) {
//            res.send(response);
//        }
//    }, fields, limit, skip);
//});

/* get policy heading or content */
router.post('/getNewsMsg', function(req, res) {
    // query items limit
    var limit = parseInt(req.body.limit);
    limit = 0 < limit && limit < 500 ? limit : 100;

    var skip = parseInt(req.body.skip);
    skip = skip > 0 ? skip : 0;

    var condition = {};
    var fields = 'heading date';

    if (req.body.infoId) {
        condition._id = db.ObjectId(req.body.infoId);
        fields = '';
    }
    if (req.body.districtId) {
        condition.districtId = req.body.districtId;
    }
    debug('condition: ' + JSON.stringify(condition));

    // 保存正常的响应数据
    var response = {status: 'ok'};
    // 用于并发访问的计数器
    var counter = {count: 2, error: false};

    db.count('news', condition, function(err, count) {
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

    db.querySort('news', condition, {date: -1}, function(err, docs) {
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
    }, fields, limit, skip);
});

/* get organization introduction */
router.get('/searchInformation/:id', function(req, res) {
    var infoId = parseInt(req.params.id);
    debug('infoId: ' + infoId);

    db.query('orgInfo', {date: new Date(infoId)}, function(err, docs) {
        if (err) {
            res.send({status: 'dbErr', message: '访问数据库系统出现异常'});
            return;
        }
        if (docs[0]) {
            res.send({status: 'ok', info: docs[0]});
        } else {
            res.send({status: 'notFound', message: '未找到相关信息'});
        }
    }, '-code -districtId');

});

/* get organization and community introduction */
router.post('/searchInformation', function(req, res) {
    var condition = {};
    var fields = '-code -districtId -introduction -picture';
    var queryLimit = 1000;
    var responseLimit = 100;
    if (req.body.id && parseInt(req.body.id)) {
        var infoId = parseInt(req.params.id);
        debug('infoId: ' + infoId);
        condition.date = new Date(infoId);
        fields = '-code -districtId -picture';
    }
    if (req.body.districtId) {
        condition.districtId = new RegExp('^' + req.body.districtId);
    }
    if (req.body.queryLimit && parseInt(req.body.queryLimit)) {
        queryLimit = parseInt(req.body.queryLimit);
    }
    if (req.body.responseLimit && parseInt(req.body.responseLimit)) {
        responseLimit = parseInt(req.body.responseLimit);
    }
    debug('searchInformation condition: ' + JSON.stringify(condition));

    // 保存正常的响应数据
    var response = {status: 'ok'};
    // 用于并发访问的计数器
    var counter = {count: 2, error: false};

    db.querySort('orgInfo', condition, {date: -1}, function(err, docs) {
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

        if (responseLimit) {
            response.info = tool.randomOrgInfo(docs, responseLimit);
        } else {
            response.info = docs[0];
        }

        if (!counter.count) {
            res.send(response);
        }

    }, fields, queryLimit);

    delete condition.date;
    fields = '-districtId -picture';
    db.querySort('communityInfo', condition, {date: -1}, function(err, docs) {
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

        response.community = tool.randomOrgInfo(docs, 1)[0];
        if (!counter.count) {
            res.send(response);
        }

    }, fields, queryLimit);

});

/* save message posted by employer */
router.post('/postEmployer', function(req, res) {
    var employer = tool.trimObject(req.body.employer);
    debug('employer: ' + JSON.stringify(employer));
    if (!employer.name || !employer.code || !employer.phone) {
        res.send({status: 'paramErr', message: '提供的招聘信息不够完整'});
        return;
    }
    // check customer identity validation
    if (!req.session.identity || req.session.identity.code != employer.code) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }
    req.session.identity = null;

    employer.date = new Date();
    // fetch organization introductionId and save with it
    db.query('orgInfo', {code: employer.code}, function(err, docs) {
        if (err) {
            res.send({status: 'dbWriteErr', message: '招聘信息保存失败'});
            return;
        }
        if (docs && docs[0]) {
            // set organization introductionId
            employer.introductionId = docs[0]['date'].getTime().toString();
        }
        // be sure no organization code will be 0
        db.save('employer', {code: '0'}, employer, function(err) {
            if (err) {
                res.send({status: 'dbWriteErr', message: '招聘信息保存失败'});
                return;
            }
            res.send({status: 'ok', message: '招聘信息保存成功'});
        });
    });

});

/* save message posted by job hunter */
router.post('/postEmployee', function(req, res) {
    var employee = tool.trimObject(req.body.employee);
    debug('employee: ' + JSON.stringify(employee));
    if (!employee.name || !employee.idNumber || !employee.phone) {
        res.send({status: 'paramErr', message: '提供的求职信息不够完整'});
        return;
    }
    if (!tool.validIdNumber(employee.idNumber)) {
        res.send({status: 'paramErr', message: '提供的身份证号有误'});
        return;
    }
    // check customer identity validation
    var identity = req.session.identity;
    if (!identity || identity.idNumber != employee.idNumber) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }
    req.session.identity = null;

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
    var employer = tool.trimObject(req.body.employer);
    //debug('organization info: ' + JSON.stringify(employer));
    if (!employer.name || !employer.code || !employer.address ||
        !employer.phone || !employer.overview) {
        res.send({status: 'paramErr', message: '提供的介绍信息不够完整'});
        return;
    }
    // check customer identity validation
    var identity = req.session.identity;
    if (!identity || identity.code != employer.code) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }

    employer.date = new Date();
    debug('organization info: ' + JSON.stringify(employer));

    db.save('orgInfo', {code: employer.code}, employer, function(err) {
        if (err) {
            res.send({status: 'dbWriteErr', message: '介绍信息保存失败'});
            return;
        }
        // update organization and employer collection with introductionId
        db.save('organization', {code: employer.code},
            {introductionId: employer.date.getTime()}, function(err) {
                if (err) {
                    res.send({status: 'dbWriteErr',
                        message: '单位信息更新失败'});
                    return;
                }
                db.save('employer', {code: employer.code},
                    {introductionId: employer.date.getTime()}, function(err) {
                        if (err) {
                            res.send({status: 'dbWriteErr',
                                message: '招聘信息更新失败'});
                            return;
                        }
                        res.send({status: 'ok', message: '介绍信息保存成功'});
                    });

            });
    });
});

/* used to upload a picture in iframe */
router.get('/uploadFile', function(req, res) {
    res.sendFile(path.join(__dirname, '../../app/mainView/upload.html'));
});

/* save organization introduction picture */
router.post('/uploadFile', function(req, res) {
    // not register or unchecked client
    var checkedInfo = req.session.identity;
    if (!req.session.user && !checkedInfo) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }

    var format = {
        jpg: 'data:image/jpg;base64,',
        png: 'data:image/png;base64,',
        gif: 'data:image/gif;base64,'
    };
    var uploadData = {picture: ''};
    var form = new multiparty.Form({
        encoding: 'utf8',
        maxFieldsSize: 10485760
        //autoFiles: false
    });
    form.on('error', function(err) {
        console.log('Error parsing form: ' + err.stack);
    });
    form.on('part', function(part) {
        var chunks = [];
        var store;
        part.on('data', function(chunk) {
            if (part.filename) {
                store = new Buffer(chunk.length);
                chunk.copy(store);
                chunks.push(store);
                return;
            }
            if (uploadData.hasOwnProperty(part.name)) {
                uploadData[part.name] += chunk.toString();
            } else {
                uploadData[part.name] = chunk.toString();
            }

        });
        part.on('end', function() {
            if (part.filename) {
                uploadData.picture = Buffer.concat(chunks).toString('base64');
                debug('upload file length: ' + uploadData.picture.length);
            } else {
                debug('upload a field');
            }
        });
    });
    form.on('close', function() {
        if (!uploadData.format || !format.hasOwnProperty(uploadData.format)) {
            uploadData.format = format['jpg'];
        } else {
            uploadData.format = format[uploadData.format];
        }
        var plain = uploadData.code;
        debug('plain: ' + plain);
        // check customer identity validation
        if (!req.session.user &&
            checkedInfo.code != plain && checkedInfo.idNumber != plain) {
            res.send({status: 'paramErr', message: '未通过身份验证'});
            return;
        }
        var model = 'orgInfo';
        var condition = {};
        if (plain.length == 9) {
            // plain save organization code
            //model = 'orgInfo';
            condition.code = plain;
        } else if (plain.length % 2 == 0) {
            // plain save district id
            model = 'communityInfo';
            condition.districtId = plain;
        } else {
            res.send({status: 'typeErr', message: '错误的上传信息'});
            return;
        }
        debug('upload complete');
        debug('uploadData attr: ' + JSON.stringify(Object.keys(uploadData)));
        var picture = uploadData['format'] + uploadData['picture'];
        db.save(model, condition, {picture: picture},
            function(err) {
                if (err) {
                    res.send({status: 'dbSaveErr', message: '文件上传失败'});
                    return;
                }
                //res.send({status: 'ok', message: '图片文件上传成功'});
                res.redirect('/uploadFile');
            });
    });
    form.parse(req);

});

/* save policy submitted by staff */
//router.post('/postPolicy', function(req, res) {
//    var policy = tool.trimObject(req.body.policy);
//    debug('Policy: ' + JSON.stringify(policy));
//    if (!policy.heading || !policy.content) {
//        res.send({status: 'paramErr', message: '提供的信息不够完整'});
//        return;
//    }
//
//    policy.date = new Date();
//
//    db.save('policy', {heading: policy.heading}, policy,
//        function(err) {
//            if (err) {
//                res.send({status: 'dbWriteErr', message: '建议信息保存失败'});
//                return;
//            }
//            res.send({status: 'ok', message: '投诉建议信息保存成功'});
//        });
//});


/* save suggestion submitted by adviser */
router.post('/postSuggestion', function(req, res) {
    var suggestion = tool.trimObject(req.body.suggestion);
    debug('suggestion: ' + JSON.stringify(suggestion));
    if (!suggestion.name || !suggestion.idNumber || !suggestion.phone) {
        res.send({status: 'paramErr', message: '提供的个人信息不够完整'});
        return;
    }
    suggestion.date = new Date();
    // check customer identity validation
    var identity = req.session.identity;
    debug('identity: ' + JSON.stringify(identity));
    if (!identity || identity.idNumber != suggestion.idNumber) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }

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
    var limit = parseInt(req.body.limit);
    limit = 0 < limit && limit < 500 ? limit : 100;

    var skip = parseInt(req.body.skip);
    skip = skip > 0 ? skip : 0;

    //var now = new Date();
    //// half a year before
    //var date = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    //var condition = {date: {$gt: date}};

    // milliseconds in a day minus one;
    var delta = 24 * 60 * 60 * 1000 - 1;

    var condition = tool.period(req.body.dateFrom, req.body.dateTo, delta);
    condition = condition ? {date: condition} : {};

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

    // 保存正常的响应数据
    var response = {status: 'ok'};
    // 用于并发访问的计数器
    var counter = {count: 2, error: false};

    db.count('employer', condition, function(err, count) {
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

    db.querySort('employer', condition, {date: -1}, function(err, docs) {
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
    }, undefined, limit, skip);
});

/* search for organization info */
router.post('/searchOrganization', function(req, res) {
    /*
    // check customer identity validation
    var identity = req.session.identity;
    debug('identity: ' + JSON.stringify(identity));
    if (!req.session.user && (!identity || !identity.idNumber)) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }
    */

    // query items limit
    var limit = parseInt(req.body.limit);
    limit = 0 < limit && limit < 500 ? limit : 100;

    var skip = parseInt(req.body.skip);
    skip = skip > 0 ? skip : 0;

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

    var queryFields = 'name phone address type economicType' +
        ' jobForm staffs introductionId';

    // 保存正常的响应数据
    var response = {status: 'ok'};
    // 用于并发访问的计数器
    var counter = {count: 2, error: false};

    db.count('organization', condition, function(err, count) {
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

    db.querySort('organization', condition, {staffs: -1}, function(err, docs) {
        counter.count--;
        if (err) {
            if (counter.error) {
                console.log('db access error');
                return;
            }
            counter.error = true;
            res.send({status: 'dbReadErr', message: '单位信息读取失败'});
            return;
        }

        for (var i = 0, len = docs.length; i < len; i++) {
            docs[i].staffs = tool.blurStaffs(docs[i].staffs);
            if (!docs[i].address) {
                docs[i] = tool.getAddress(docs[i]);
            }
        }
        debug('organization list length: ' + docs.length);
        response.list = docs;
        if (counter.count == 0) {
            res.send(response);
        }
    }, queryFields, limit, skip);
});

/* search for manpower info */
router.post('/searchManpower', function(req, res) {
    // check customer identity validation
    var identity = req.session.identity;
    debug('identity: ' + JSON.stringify(identity));
    if (!req.session.user && (!identity || !identity.code)) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }

    // query items limit
    var limit = parseInt(req.body.limit);
    limit = 0 < limit && limit < 500 ? limit : 100;

    var skip = parseInt(req.body.skip);
    skip = skip > 0 ? skip : 0;

    // milliseconds in a day minus one;
    var delta = 24 * 60 * 60 * 1000 - 1;

    var condition = tool.period(req.body.dateFrom, req.body.dateTo, delta);
    condition = condition ? {date: condition} : {};

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

    // 加入性别和年龄的查询条件
    var where = tool.manpowerWhere(req.body.gender,
        req.body.ageFrom, req.body.ageTo);
    if (where) {
        condition.$where = where;
        debug('where: ' + condition.$where.toString());
    }

    debug('search manpower condition: ' + JSON.stringify(condition));

    // 保存正常的响应数据
    var response = {status: 'ok'};
    // 用于并发访问的计数器
    var counter = {count: 2, error: false};

    db.count('employee', condition, function(err, count) {
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
        debug('count: ' + count);
        response.count = count;
        if (counter.count == 0) {
            res.send(response);
        }
    });

    db.querySort('employee', condition, {date: -1}, function(err, docs) {
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
        for (var i = 0, len = docs.length; i < len; i++) {
            docs[i].age = tool.blurAge(tool.getAge(docs[i]));
            docs[i].gender = tool.getGender(docs[i]);
        }
        response.list = docs;
        debug('docs.length: ' + docs.length);
        if (counter.count == 0) {
            res.send(response);
        }
    }, '', limit, skip);
});

/* search for worker info */
router.post('/searchWorker', function(req, res) {
    // check customer identity validation
    var identity = req.session.identity;
    debug('identity: ' + JSON.stringify(identity));
    if (!req.session.user && (!identity || !identity.code)) {
        res.send({status: 'paramErr', message: '未通过身份验证'});
        return;
    }

    var condition = {};
    //if (req.body.gender) {
    //    condition.gender = req.body.gender;
    //}
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

    // 加入性别和年龄的查询条件
    var where = tool.manpowerWhere(req.body.gender,
        req.body.ageFrom, req.body.ageTo);
    if (where) {
        condition.$where = where;
        debug('where: ' + condition.$where.toString());
    }

    debug('search manpower condition: ' + JSON.stringify(condition));

    // query items limit
    var limit = parseInt(req.body.limit);
    limit = 0 < limit && limit < 500 ? limit : 100;

    var skip = parseInt(req.body.skip);
    skip = skip > 0 ? skip : 0;

    // 保存正常的响应数据
    var response = {status: 'ok'};
    // 用于并发访问的计数器
    var counter = {count: 2, error: false};

    db.count('person', condition, function(err, count) {
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
        debug('count: ' + count);
        response.count = count;
        if (counter.count == 0) {
            res.send(response);
        }
    });

    db.query('person', condition, function(err, docs) {
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
        var data = [];
        for (var i = 0, len = docs.length; i < len; i++) {
            docs[i] = tool.filterWorkerMsg(docs[i]);
        }
        response.list = docs;
        debug('searched worker data length: ' + docs.length);
        if (counter.count == 0) {
            res.send(response);
        }
    }, '', limit, skip);
});

/* GET clause page. */
//router.get('/etc/clause', function(req, res) {
//  res.sendFile(path.join(__dirname, '../../app/etcView/clause.html'));
//});

module.exports = router;
