var debug = require('debug')('tool');
var path = require('path');
//var util = require('util');
var fs = require('fs');
var _ = require('lodash');

var refPath = require('../config').uploadPath;
var jobType = require('./jobType');
var districtName = require('./districtId');

// 解析读入并解析JSON文件
function readJsonFile(filePath) {
    try {
        var data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        console.log('read file %j error', filePath);
        return '';
    }
}

// 向db指定的数据库中写入日志信息
function log(db, doc, comment, status) {
    doc = doc ? doc : {};
    doc.time = new Date();
    if (comment) {
        doc.comment = comment;
    }
    if (status) {
        doc.status = status;
    }
    //console.log('logMsg: ' + JSON.stringify(doc));
    db.save('log', {time: 0}, doc, function(err) {
        if (err) {
            console.log('error: ' + JSON.stringify(err));
        }
    });
}

// 开始时间点为start，结束时间点为end后延delta毫秒，delta可以是负数。
// timezone为原始时间的时区偏移量，依照惯例，单位是分钟。
// start和end为YYYY-MM-DD形式，或其他可用于正确为Date初始化的量
// 返回格式为{$gte: from, $lte: to}，时间值为国际标准时间
function period(start, end, delta, timezone) {
    if (isNaN(timezone) || timezone < -720 || 720 < timezone) {
        timezone = 0;
    }
    var span = {};
    if (start) {
        var from = new Date(start);
        if (from.toDateString() != "Invalid Date") {
            span.$gte = new Date(from.getTime() + timezone * 60000);
        }
    }
    if (end) {
        var to = new Date(end);
        if (to.toDateString() != "Invalid Date") {
            span.$lte = new Date(to.getTime() + timezone * 60000 + delta);
        }
    }
    if (span.hasOwnProperty('$gte') || span.hasOwnProperty('$lte')) {
        return span;
    }
}

// 返回格式为{$gte: from, $lte: to}，如果给定参数无效，则返回空
function interval(from, to) {
    var span = {};
    if (!isNaN(parseFloat(from))) {
        span.$gte = from;
    }
    if (!isNaN(parseFloat(to))) {
        span.$lte = to;
    }
    if (span.hasOwnProperty('$gte') || span.hasOwnProperty('$lte')) {
        return span;
    }
}

// 列出指定目录中的文件列表
// 回调函数为callback(err, data, res)
function listFiles(res, relativePath, callback) {
    var fullPath = path.join(__dirname, refPath.voucher, relativePath);
    debug('fullPath: ' + fullPath);
    fs.readdir(fullPath, function (err, files) {
        debug('files' + JSON.stringify(files));
        //categoryFiles(relativePath, files, err, res, callback);
        if (err || files.length == 0) {
            callback(err, {dirs: [], files: [], path: relativePath}, res);
            return;
        }
        var dirs = [];
        var stdFiles = [];
        var counter = {count: 0};
        for (var i = 0; i < files.length; i++) {
            counter.count++;
            fs.stat(fullPath + '/' + files[i], function(file) {
                return function (err, stats) {
                    counter.count--;
                    if (err && counter.count) {
                        return;
                    }
                    if (stats.isDirectory()) {
                        dirs.push(file);
                    } else if (stats.isFile()) {
                        stdFiles.push(file);
                    }
                    if (!counter.count) {
                        var data = {
                            dirs: dirs.sort(),
                            files: stdFiles.sort(),
                            path: relativePath
                        };
                        debug('file data: ' + JSON.stringify(data));
                        callback(null, data, res);
                    }
                    debug('counter.count: ' + counter.count);
                }
            }(files[i]));
        }
    });
}

// 由指定参数获取路径，并读取文件
function readFile(relativePath, callback) {
    //var filePath = voucherFilePath(params);
    var filePath = path.join(__dirname, refPath.voucher, '..', relativePath);
    debug('file path: ' + filePath);

    fs.readFile(filePath, function(err ,data) {
        if (err) {
            callback({status: 'errReadFile', target: relativePath,
                message: '无法读取文件'});
            return;
        }
        callback({data: data, status: 'ok', target: relativePath,
            message: '成功读取文件'});
    });
}

// 返回薪水范围的mongodb查询结构
function salarySpan(index) {
    if (!index || index <= 0 || index > 5) {
        return;
    }
    var span = [
        {},
        {$lte: 1500},
        {$gte: 1500, $lte: 3000},
        {$gte: 3000, $lte: 5000},
        {$gte: 5000, $lte: 10000},
        {$gte: 10000}
    ];
    return span[index];
}

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

// 从身份证号验证年龄是否满足条件，只是粗略验证，不考虑月份和日期
function validAge(from, to, idNumber) {
    if (!idNumber) {
        return false;
    }
    var birth = +idNumber.toString().slice(6, 10);
    var now = (new Date()).getFullYear();
    return (!from || birth <= now - from ) && (!to || now - to <= birth);
}

// 将精确职员数变为粗略范围
function blurStaffs(n) {
    if (n <= 10) {
        return '少于或等于10人'
    } else if (n <= 100) {
        return '介于10到100人';
    } else if (n <= 1000) {
        return '介于100到1000人';
    } else if (n <= 10000) {
        return '介于1000到10000人';
    } else if (n > 10000) {
        return '10000人以上';
    } else {
        return '';
    }
}

// 将单位规模转换为查询条件
function orgScale(scale) {
    if (!scale) {
        return;
    }
    if (scale == 'tiny') {
        return {$lte: 10};
    } else if (scale == 'small') {
        return {$gt: 10, $lte: 100};
    } else if (scale == 'middle') {
        return {$gt: 100, $lte: 1000};
    } else if (scale == 'large') {
        return {$gt: 1000, $lte: 10000};
    } else {
        return {$gt: 10000};
    }
}

// 将精确的年龄变为粗略的范围
function blurAge(n) {
    if (n < 20) {
        return '不到20岁'
    } else if (n <= 30) {
        return '介于20到30岁';
    } else if (n <= 40) {
        return '介于30到40岁';
    } else if (n <= 50) {
        return '介于40到50岁';
    }  else if (n <= 60) {
        return '介于50到60岁';
    }  else if (n > 60) {
        return '大于60岁';
    } else {
        return '';
    }
}

// 由个人信息生成地址
function getAddress(person) {
    if (person && person.address) {
        if ((typeof person.address) == 'object') {
            var a = person.address;
            return a.county + a.town + a.village;
        } else {
            return person.address;
        }
    }
    if (person.districtId) {
        return districtToAddress(person.districtId);
    }
}

// 由行政区划代码得到地址
function districtToAddress(districtId) {
    var address = districtName['0'];
    var countyId = districtId.slice(0, 6);
    if (districtId.length >= 4) {
        if (!districtName['4311'].hasOwnProperty(countyId)) {
            return address;
        }
        address += districtName['4311'][countyId];
        if (!districtName[countyId].hasOwnProperty(districtId.slice(0, 8))) {
            return address;
        }
        address += districtName[countyId][districtId.slice(0, 8)];
        if (!districtName[districtId.slice(0, 8)].hasOwnProperty(districtId)) {
            return address;
        }
        address += districtName[districtId.slice(0, 8)][districtId];
    }
    return address;
}

// 由身份证获取性别
function getGender(person) {
    if(!person || !person.idNumber) {
        return ''
    }
    var id = person.idNumber.toString().slice(16, 17);
    if(!id) {
        return '';
    }
    return id % 2 == 0 ? '女' : '男';
}

// 由身份证获取年龄
function getAge(person) {
    if(!person || !person.idNumber) {
        return ''
    }
    var birth = person.idNumber.toString().slice(6, 10);
    if(!birth || birth.length != 4) {
        return '';
    }
    return (new Date()).getFullYear() - birth;
}

// 由年龄区间，转换为出生日期区间
function birthSpan(age1, age2) {
    var year = (new Date()).getFullYear();
    return {
        from: year - age2,
        to: year - age1
    };
}

// 由工种编号翻译为名称，如果不是有效工种则直接返回
function jobTypeToName(job) {
    if (!job) {
        return '';
    }
    var category = job[0];
    if (!jobType.local.hasOwnProperty(category)) {
        return job;
    }
    var name = jobType.local[category][job];
    return name == '其他' ? '' : name;
}

// 过滤不需要的个人信息，并特别处理部分信息
function filterWorkerMsg(worker) {
    var o = {};
    o.username = worker.username;
    o.gender = getGender(worker);
    o.age = blurAge(getAge(worker));
    o.employment = worker.employment;
    if (worker.employmentInfo) {
        o.salary = worker.employmentInfo.salary;
        o.experience =  worker.employmentInfo.jobType;
    } else if (worker.unemploymentInfo) {
        o.salary = worker.unemploymentInfo.preferredSalary;
        o.experience =  worker.unemploymentInfo.preferredJobType;
    }
    // 将年薪改为月薪，单位由万元改为元（如果本身大于10000，则默认就是以元为单位）
    if (!o.salary) {
        o.salary = '';
    } else if (o.salary <= 100) {
        o.salary = Math.floor(o.salary * 100 / 12) * 100;
    } else if (o.salary > 10000) {
        o.salary = Math.floor(o.salary / 1200) * 100;
    }
    o.experience = jobTypeToName(o.experience);
    o.education = worker.education;
    o.address = worker.address.town + worker.address.village;
    return o;
}

// 从docs中随机选取responseLimit个元素并将每个元素的时间参数转换为相应数字
function randomOrgInfo(docs, responseLimit) {
    if (!docs || !docs.length) {
        return [];
    }

    var limit = responseLimit || 3;
    var data = _.sample(docs, limit);
    for (var i = 0, len = data.length; i < len; i++) {
        if (data[i].hasOwnProperty('date')) {
            data[i].date = data[i].date.getTime().toString();
        }
    }
    debug('random data length: ' + data.length);
    return data;
}

// 获取图片（base64数据）中的数据部分
function base64ImgData(picture) {
    if (!picture) {
        return '';
    }
    var data = picture.split(',')[1];
    if (!data) {
        return '';
    }
    return new Buffer(data, 'base64');
}

// 获取图片（base64数据）中的文件格式（扩展名）部分
function base64ImgType(picture) {
    if (!picture) {
        return 'jpg';
    }
    var head = picture.split(';')[0];
    if (!head) {
        return 'jpg';
    }
    return head.slice(5);
}

// 将base64格式的数据转换为默认的utf8格式
function base64ToUtf8(d) {
    var data = new Buffer(d, 'base64');
    return data.toString('utf8');
}

/* shallow copy of the object and trim the leading&trailing spaces */
function trimObject(obj) {
    var trimmed = {};
    var tmp;
    for (var a in obj) {
        if (!obj.hasOwnProperty(a)) {
            continue;
        } else if ((typeof obj[a]) != 'string') {
            tmp = obj[a];
        } else {
            tmp = obj[a].toString().trim();
        }
        trimmed[a] = tmp;
    }
    return trimmed;
}

// 用户查询人员求职信的$where查询条件
function manpowerWhere(gender, ageFrom, ageTo) {
    var sex = -1;
    if (gender == '男') {
        sex = 1;
    } else if (gender == '女') {
        sex = 0;
    }
    var year = (new Date()).getFullYear();
    var yearFrom = parseInt(ageTo);
    var yearTo = parseInt(ageFrom);
    yearFrom = yearFrom > 0 ? year - yearFrom : -1;
    yearTo = yearTo > 0 ? year - yearTo : -1;

    var base = ' return !this.idNumber || this.idNumber.length != 18';
    var cond = true;
    if (sex >= 0) {
        cond += ' && this.idNumber[16] % 2 == ' + sex;
    }
    var first = 'var year = this.idNumber.slice(6, 10); ';
    if (yearFrom > 0) {
        cond += ' && ' + yearFrom + ' <= year';
    }
    if (yearTo > 0) {
        cond += ' && ' + 'year <= ' + yearTo;
    }
    if (sex == -1 && yearFrom == -1 && yearTo == -1) {
        return '';
    }
    return first + base + ' || ' + cond;
}

module.exports = {
    log: log,
    period: period,
    interval: interval,
    readFile: readFile,
    listFiles: listFiles,
    readJsonFile: readJsonFile,
    salarySpan: salarySpan,
    validAge: validAge,
    validCode: validCode,
    validIdNumber: validIdNumber,
    blurStaffs: blurStaffs,
    blurAge: blurAge,
    filterWorkerMsg: filterWorkerMsg,
    getAge: getAge,
    getGender: getGender,
    orgScale: orgScale,
    birthSpan: birthSpan,
    getAddress: getAddress,
    districtToAddress: districtToAddress,
    randomOrgInfo: randomOrgInfo,
    base64ImgData: base64ImgData,
    base64ImgType: base64ImgType,
    base64ToUtf8: base64ToUtf8,
    trimObject: trimObject,
    manpowerWhere: manpowerWhere
};