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
    return name + '@' + domain + 'com';
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
    return floor(random() * 9 + 1) * 1000;
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
        phone: phone(),
        contact: contact(),
        //address: tmp,
        position: position(),
        description: jobDescription(),
        education: education(),
        date: modifiedDate()
        //salary: salary()
    };
    var tmp = address();
    tmp = tmp.county + tmp.town + tmp.village;
    msg.address = tmp;
    tmp = salary();
    if (tmp) {
        msg.salary = tmp;
    }
    return msg;
}

// 增加n条招聘数据
function addJob(n) {
    for (var i = 0; i < n; i++) {
        db.save('employer', {code: '0'}, createJob(), function(err) {
            if (err) {
                console.log('生成数据时遇到问题');
            }
        });
    }
}
console.log(new Date());
addJob(1000);
//console.log(createJob());
console.log(new Date());
