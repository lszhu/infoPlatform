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
    var communityInfoSchema = new mongoose.Schema(schema.communityInfo);
    //var policySchema = new mongoose.Schema(schema.policy);
    var newsSchema = new mongoose.Schema(schema.news);
    var organizationSchema = new mongoose.Schema(schema.organization);
    var personSchema = new mongoose.Schema(schema.person);
    var suggestionSchema = new mongoose.Schema(schema.suggestion);
    var logSchema = new mongoose.Schema(schema.log);
    var accountSchema = new mongoose.Schema(schema.account);
    var groupSchema = new mongoose.Schema(schema.group);

    return {
        employer: mongoose.model('employer', employerSchema),
        employee: mongoose.model('employee', employeeSchema),
        orgInfo: mongoose.model('orgInfo', orgInfoSchema),
        communityInfo: mongoose.model('communityInfo', communityInfoSchema),
        //policy: mongoose.model('policy', policySchema),
        news: mongoose.model('news', newsSchema),
        organization: mongoose.model('organization', organizationSchema),
        // temporary change collection name to hrmsg
        person: mongoose.model('hrmsg', personSchema),
        suggestion: mongoose.model('suggestion', suggestionSchema),
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
function query(model, condition, callback, fields, limit, skip) {
    var limitation = limit ? limit : maxReturnedDoc;
    models[model]
        .find(condition, fields)
        .skip(skip)                 // skip some docs at first
        .limit(limitation)          // limit returned documents
        .lean()                     // return plain javascript objects
        .exec(callback);            // callback(err, docs)
}

// like query but add sort function, sorter indicate sort parameter
// sorter is like {field1: 1, field2: -1}, 1 for ascending, -1 for descending
function querySort(model, condition, sorter, callback, fields, limit, skip) {
    var limitation = limit ? limit : maxReturnedDoc;
    models[model]
        .find(condition, fields)
        .skip(skip)                 // skip some docs at first
        .limit(limitation)          // limit returned documents
        .sort(sorter)               // returned sorted documents
        .lean()                     // return plain javascript objects
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
    ObjectId: mongoose.Types.ObjectId,
    query: query,
    querySort: querySort,
    queryOne: queryOne,
    save: save,
    remove: remove,
    count: count,
    getAccount: getAccount
};