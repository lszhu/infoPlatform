var fs = require('fs');
var path = require('path');

// 指定生成数据的原始数据目录
var base = '../../server/';

var nameResource = require('./name');
var staticData = require('./staticData');

var db = require('../../server/lib/mongodb');

var district = require(base + 'lib/districtId');

// 速写方式
var random = Math.random;
var floor = Math.floor;

var countyId = require(base + 'config').districtId;
countyId = countyId ? countyId : district['4311'][0];

// count administrative region in certain district
function countRegion(districtId) {
    if (!district.hasOwnProperty(districtId)) {
        return 0;
    }
    var area = district[districtId];
    var counter = 0;
    for (var i in area) {
        if (area.hasOwnProperty(i)) {
            counter++;
        }
    }
    return counter;
}

// 随机选取行政区划代码
function randomDistrictId() {
    var tmp = Object.keys(district[countyId]);
    var index = floor(random() * tmp.length);
    tmp = Object.keys(district[tmp[index]]);
    index = floor(random() * tmp.length);
    return tmp[index];
}

// 随机生成姓名
function name(nameSrc) {
    var name = '';
    var index = random() * nameSrc.surname.length;
    // 让生成的随机数更集中在索引的靠前位置，以引用更常见的姓氏
    index = floor(random() * random() * index);
    //console.log('index: ' + index);
    name += nameSrc.surname.charAt(index);
    index = floor(random() * nameSrc.name.length);
    // 以80%的概率生成两个字的名字，其余20%的为单名
    //console.log('index: ' + index);
    if (random() < 0.8) {
        if (index % 2 == 0) {
            name += nameSrc.name.slice(index, index + 2);
        } else {
            name += nameSrc.name.slice(index - 1, index + 1);
        }
    } else {
        name += nameSrc.name.charAt(index);
    }
    return name;
}


// 随机生成单位名称
function orgName(nameSrc) {
    var company = ['酒楼', '大酒店', '有限公司', '加工厂', '专卖店',
        '宾馆', '书店', '连锁店', '批发部', '服装店', '五金店'];
    var name = '';
    var index = random() * nameSrc.surname.length;
    // 让生成的随机数更集中在索引的靠前位置，以引用更常见的姓氏
    index = floor(random() * random() * index);
    //console.log('index: ' + index);
    name += nameSrc.surname.charAt(index);
    index = floor(random() * nameSrc.name.length);
    // 以80%的概率生成两个字的名字，其余20%的为单名
    //console.log('index: ' + index);
    if (random() < 0.8) {
        if (index % 2 == 0) {
            name += nameSrc.name.slice(index, index + 2);
        } else {
            name += nameSrc.name.slice(index - 1, index + 1);
        }
    } else {
        name += nameSrc.name.charAt(index);
    }
    var len = company.length;
    index = floor(random() * len);
    return name + company[index];
}

// 随机生成地址，包括districtId, county, town, village，依赖于外部district数据
function address() {
    var townN = countRegion(countyId);
    // 让生成的随机数更集中在索引的靠前位置，以引用人口更多的区域，并转换为字符串
    var townId = countyId * 100 + floor(random() * random() * townN) + 1 + '';
    var villageN = countRegion(townId);
    var villageId = townId * 100 + floor(random() * villageN) + 1 + '';
    return {
        county: district['4311'][countyId],
        town: district[countyId][townId],
        village: district[townId][villageId],
        districtId: villageId
    };
}

// 由行政区划代码得到地址
function districtToAddress(districtId) {
    var districtName = district;
    var address = districtName['0'];
    var countyId = districtId.slice(0, 6);
    if (districtId.length >= 4) {
        if (!districtName['4311'].hasOwnProperty(countyId)) {
            return address;
        }
        address.county = districtName['4311'][countyId];
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

function idNumber(birth) {
    //create district id, the reason of adding 1800 is 431127 + 1800 = 432927
    var district = +countyId + 1800;
    if (random() < 0.5) {
        district = countyId;
    } else if (random() < 0.2) {    // 20% of other districtId
        district = floor(random() * 9) + 1 + '';
        for (i = 0; i < 5; i++) {
            district += floor(random() * 10);
        }
    }
    // create serial number
    var serial = '';
    for (i = 0; i < 3; i++) {
        serial += floor(random() * 10);
    }

    // create checksum byte
    var partialId = district + birth + serial;
    var weights = [
        '7', '9', '10', '5', '8', '4', '2', '1', '6',
        '3', '7', '9', '10', '5', '8', '4', '2', '1'
    ];
    var sum = 0;
    for (var i = 0; i < 17; i++) {
        var digit = partialId.charAt(i);
        sum += digit * weights[i];
    }
    sum = (12 - sum % 11) % 11;
    // checksum byte
    sum = (sum == 10 ? 'X' : sum.toString());

    return partialId + sum;
}

// 由身份证号得到年龄
function age(idNumber) {
    var now = (new Date()).getFullYear();
    var year = idNumber.slice(6, 10);
    return now - year;
}

// 由身份证号得到性别
function gender(idNumber) {
    return idNumber.charAt(16) % 2 ? '男' : '女';
}

// 组织机构代码，也可作为QQ号
function orgCode() {
    var n = 1 + random() * 9;
    return floor(n * 1000000000);
}

// 邮箱
function email() {
    var alpha = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var domain = '';
    var name = '';
    var tmp, i;
    for (i = 0; i < 10; i++) {
        tmp = floor(random() * 72);
        if (tmp < 36) {
            domain += alpha[tmp];
        }
    }
    for (i = 0; i < 15; i++) {
        tmp = floor(random() * 72);
        if (tmp < 36) {
            name += alpha[tmp];
        }
    }
    return name + '@' + domain + '.com';
}

function phone() {
    var n = '13';
    for (var i = 0; i < 9; i++) {
        n += floor(random() * 10);
    }
    return n;
}

// 其他联系方式
function contact() {
    var part = random();
    if (part < 0.6) {
        return '';
    } else if (part < 0.8) {
        // 生成QQ号
        return 'QQ' + orgCode();
    } else {
        return email();
    }
}

function jobType(list) {
    //var category = [];
    var types = [];
    for (var a in list) {
        if (!list.hasOwnProperty(a)) {
            continue;
        }
        // 保存大类信息
        //category.push(a);
        for (var b in list[a]) {
            if (!list[a].hasOwnProperty(b)) {
                continue;
            }
            types.push(b);
        }
    }
    /*
    // 20%选择粗略的大类
    if (random() < 0.2) {
        return category[floor(random() * category.length)];
    }
    */
    return types[floor(random() * types.length)];
}

// 职位
function position() {
    if (random() < 0.6) {
        return '';
    }
    var list = staticData.position;
    var len = list.length;
    return list[floor(random() * len)];
}

// 职位描述
function jobDescription() {
    if (random() < 0.6) {
        return '';
    }
    var list = staticData.jobDescription;
    var len = list.length;
    return list[floor(random() * len)];
}

// 工作年限
function seniority() {
    if (random() < 0.6) {
        return '';
    }
    var list = staticData.seniority;
    var len = list.length;
    return list[floor(random() * len)];
}

// 学历
function education() {
    if (random() < 0.6) {
        return '';
    }
    var list = staticData.education;
    var len = list.length;
    return list[floor(random() * len)];
}

// 月薪
function salary() {
    //return (Math.pow(random(), 2) * 300) / 10 + 1;
    if (random() < 0.6) {
        return;
    }
    return floor((random() * random() * 5 + 1) * 10) * 100;
}

// 填写日期
function modifiedDate() {
    var year = 1000 * 60 * 60 * 24 * 365;
    return new Date(Date.now() - random() * year);
}

// 创建一条招聘数据内容
function createJob() {
    var msg =  {
        name: orgName(nameResource),
        code: orgCode(),
        districtId: randomDistrictId(),
        phone: phone(),
        contact: contact(),
        //address: tmp,
        position: position(),
        description: jobDescription(),
        education: education(),
        date: modifiedDate()
        //salary: salary()
    };
    //var tmp = address();
    //tmp = tmp.county + tmp.town + tmp.village;
    msg.address = districtToAddress(msg.districtId);
    tmp = salary();
    if (tmp) {
        msg.salary = tmp;
    }
    return msg;
}

// 增加n条伪造招聘数据
function addJob(n) {
    for (var i = 0; i < n; i++) {
        db.save('employer', {code: '0'}, createJob(), function(err) {
            if (err) {
                console.log('生成数据时遇到问题');
            }
        });
    }
}

// 创建一条求职信息内容
function createManpower() {
    // 随机生成16到61岁的年龄（毫秒数）
    var age = (random() * 45 + 16) * 365 * 24 * 3600 * 1000;
    // 由年龄推算出生年份，粗略估计即可
    var birth = new Date(Date.now() - age);
    var birthString = '' + birth.getFullYear();
    var tmp = birth.getMonth() + 1;
    birthString += (tmp < 10 ? '0' : '') + tmp;
    tmp = birth.getDate();
    birthString += (tmp < 10 ? '0' : '') + tmp;
    //console.log(birthString + ': ' + idNumber(birthString));

    var msg =  {
        name: name(nameResource),
        idNumber: idNumber(birthString),
        districtId: randomDistrictId(),
        phone: phone(),
        contact: contact(),
        education: education(),
        seniority: seniority(),
        experience: jobDescription(),
        position: position(),
        //salary: salary(),
        date: new Date()
    };
    tmp = salary();
    if (tmp) {
        msg.salary = tmp;
    }
    return msg;
}
// 测试生成的求职信息
//console.log(createManpower());

// 增加n条伪造求职数据
function addManpower(n) {
    var manpower;
    for (var i = 0; i < n; i++) {
        manpower = createManpower();
        db.save('employee', {idNumber: manpower.idNumber}, manpower,
            function(err) {
                if (err) {
                    console.log('生成数据时遇到问题');
                }
        });
    }
}

// 从文件（csv格式）读入单位数据列表
function parseCsv(pathname) {
    try {
        var file = fs.readFileSync(pathname, 'utf8');
    } catch (e) {
        console.log('read file error: ', e);
        return;
    }
    // 移除空格
    file = file.replace(/\ /gm, '');
    file = file.split('\r\n');
    var data = [];
    for (var i = 1, len = file.length; i < len; i++) {
        data.push(file[i].split(','));
    }
    return data;
}

// 校验组织机构代码，代码共9位，最后一位是校验码
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
// 测试validCode函数
//console.log('test validcode: ' + validCode('743719761'));

// 调整格式化单位数据
function formatOrgData(org) {
    if (!org[4]) {
        return;
    }
    var code = org[4].replace(/-/g, '').toUpperCase();
    if (!validCode(code)) {
        return;
    }
    var num = org[14] > 0 ? org[14] : 0;
    var districtId = org[1] ? org[1].slice(0, 10) : countyId;
    var tmp = address();
    tmp = tmp.county + tmp.town + tmp.village;
    tmp = org[8] ? org[8] : tmp;
    return {
        name: org[3],
        code: code,
        districtId: districtId,
        legalPerson: org[5],
        contact: org[6],
        phone: org[7],
        address: tmp,
        type: org[9],
        economicType: org[10],
        jobForm: org[11],
        industry: org[12],
        staffs: num,
        modifiedDate: new Date()
    };
}

// 将单位信息批量写入数据库
function addOrg() {
    var data = parseCsv('org.csv');
    var count = 0;
    var org;
    for (var i = 0, len = data.length; i < len; i++) {
        org = formatOrgData(data[i]);
        if (org) {
            count++;
            //console.log(tmp);
            db.save('organization', {code: org.code}, org, function(err) {
                if (err) {
                    console.log('db write error');
                }
            });
        }

    }
    console.log('共导入条目数为：' + count);
}

console.log(new Date());
//console.log(parseCsv('org.csv'));
// 从文件读取单位信息并加入数据库
//addOrg();
// 批量创建伪造求职数据并写入数据库
//addManpower(1000);
// 批量创建伪造招聘信息并写入数据库
addJob(1000);
//console.log(createJob());
console.log(new Date());

// 测试person数据集
//db.query('person', undefined, function(err, docs) {
//    console.log('count: ' + docs.length);
//});