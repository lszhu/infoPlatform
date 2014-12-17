// 此处设置web服务的端口号
var httpPort = 12345;

// 此处设置web服务使用环境，可以是开发环境或生产环境
var runningEnvironment = 'development';
//var runningEnvironment = 'productivity';

// 区域ID，可作为系统唯一标识，可用于一个服务器安装多个服务
var districtId = '431103';

// 存放上传文件的路径，建议用相对路径
var uploadPath = '../../upload';

// 此处修改内置管理员账号的名称和密码等信息
var builtinAccount = {
    username: 'admin',            // 管理员名称
    password: 'admin',            // 管理员密码
    groups: ['administrator'],    // 管理员所属组号
    rights: 'administrator', //{},             // 除组规定的权限外的额外权限
    enabled: true,                // 启用状态
    description : 'builtin administrator'
};

// 此处设定mongodb数据库服务器的参数：链接地址、端口、数据库
var dbServer = {
    address: 'localhost:',        // 数据库服务器地址
    port: '27017',                // 数据库服务端口
    dbName: 'messagepost'         // 数据库名称
};

// 此处设定连接mongodb数据库的参数
var dbParameters = {
    user: 'website',               // 数据库连接用户名称
    pass: 'messagePostSys',        // 数据库连接用户密码
    //user: 'hrsys',
    //pass: 'letmein',
    server: {
        socketOptions: {keepAlive: 1},
        auto_reconnect: false      // 请不要修改此参数
    }
};

// 对查询数据库结果数目作出限制，以保证系统性能，避免假死
var queryLimit = 100000;

module.exports = {
    port: httpPort,
    runningEnv: runningEnvironment,
    districtId: districtId,
    uploadPath: uploadPath,
    builtinAccount: builtinAccount,
    db: {
        server: dbServer,
        parameter: dbParameters
    },
    queryLimit: queryLimit
};