var mongoose = require('mongoose');
var debug = require('debug')('mongodb');

// mongodb server parameters
var db = require('../config').db;
// Specifies the maximum number of documents the query will return
var maxReturnedDoc = require('../config').queryLimit;
// mongodb schema used to create mongoose schema and model
var schema = require('./schema');

// initiate a connection to mongodb
function connectDb() {
    var reconnect;
    mongoose.connect('mongodb://' + db.server.address + ':' +
    db.server.port + '/' + db.server.dbName, db.parameter);

    mongoose.connection.on('error', function(err) {
        console.error('connection error:', err);
        mongoose.disconnect();
    });
    mongoose.connection.on('connected', function() {
        clearTimeout(reconnect);
        console.log('database connected.');
    });
    mongoose.connection.on('disconnected', function() {
        // if connection failed, retry after 10s
        reconnect = setTimeout(function() {
            mongoose.connect('mongodb://' + db.server.address + ':' +
            db.server.port + '/' + db.server.dbName, db.parameter);
        }, 10000);
        console.log('database disconnected.');
    });
    //mongoose.connection.once('open', function() {
    //    console.log('database connection opened.');
    //});
}

// create collection models
function createModels() {
    var employerSchema = new mongoose.Schema(schema.employer);
    var employeeSchema = new mongoose.Schema(schema.employee);
    var orgInfoSchema = new mongoose.Schema(schema.orgInfo);
    var policySchema = new mongoose.Schema(schema.policy);
    var messageSchema = new mongoose.Schema(schema.message);
    var organizationSchema = new mongoose.Schema(schema.organization);
    var personSchema = new mongoose.Schema(schema.person);
    var logSchema = new mongoose.Schema(schema.logs);
    var accountSchema = new mongoose.Schema(schema.account);
    var groupSchema = new mongoose.Schema(schema.group);

    return {
        employer: mongoose.model('employer', employerSchema),
        employee: mongoose.model('employee', employeeSchema),
        orgInfo: mongoose.model('orgInfo', orgInfoSchema),
        policy: mongoose.model('policy', policySchema),
        message: mongoose.model('message', messageSchema),
        organization: mongoose.model('organization', organizationSchema),
        person: mongoose.model('person', personSchema),
        log: mongoose.model('log', logSchema),
        account: mongoose.model('account', accountSchema),
        group: mongoose.model('group', groupSchema)
    };
}

// connect to mongodb when system started
connectDb();
// create models being used
var models = createModels();

// the parameter fields should be a string like 'a b -c d -e -f'
// or an object like {a: 1, b: 1, c: 0, d: 1, e: 0, f: 0}
function query(model, condition, callback, fields, limit) {
    limitation = limit ? limit : maxReturnedDoc;
    models[model]
        .find(condition, fields)
        .lean()                     // make return value changeable
        .limit(limitation)          // limit returned documents
        .exec(callback);            // callback(err, docs)
}

function queryOne(model, condition, callback) {
    models[model]
        .findOne(condition)
        .lean()                     // make return value changeable
        .exec(callback);            // callback(err, doc)
}

function remove(model, condition, callback) {
    models[model]
        .remove(condition, callback);   // callback(err)
}

function save(model, condition, data, callback) {
    models[model]           // callback(err, numberAffected, rawResponse)
        .update(condition, data, {upsert: true, multi: true}, callback);
}

function count(model, condition, callback) {
    models[model]
        .count(condition, callback);    //callback(err, count)
}

function getAccount(username, callback) {
    queryOne('account', {username: username}, callback);
}

module.exports = {
    query: query,
    queryOne: queryOne,
    save: save,
    remove: remove,
    count: count,
    getAccount: getAccount
};