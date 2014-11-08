var debug = require('debug')('tool');
var path = require('path');
var util = require('util');
//var excel = require('j');
var xlsx = require('xlsx');
var fs = require('fs');

var refPath = require('../config').path;

var dictionary = readJsonFile(
    path.join(__dirname, '../../staticData/dictionary.json'));


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

module.exports = {
    log: log,
    period: period,
    interval: interval,
    readFile: readFile,
    listFiles: listFiles
};