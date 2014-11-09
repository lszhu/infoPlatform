var mongoose = require('mongoose');
var debug = require('debug')('mongodb');

// mongodb server parameters
var db = require('../config').db;
// Specifies the maximum number of documents the query will return
var maxReturnedDoc = require('../config').queryLimit;

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

    var logSchema = new mongoose.Schema({
        time: Date,
        operator: String,
        operation: String,
        target: String,
        comment: String,
        status: String
    });

    var accountSchema = new mongoose.Schema({
        username: String,
        password: String,
        enabled: Boolean,
        description: String,
        groups: [String],
        rights: String
    });

    var groupSchema = new mongoose.Schema({
        name: String,
        comment: String,
        accounts: [String],
        rights: {
            system: {
                log: Boolean,
                account: Boolean,
                group: Boolean
            },
            projects: Boolean,
            subjects: Boolean,
            date: {
                begin: Boolean,
                end: Boolean
            },
            figures: {
                readable: Boolean,
                removable: Boolean
            },
            voucher: Boolean,
            contract: Boolean,
            archive: {
                figure: Boolean,
                cheque: Boolean,
                contract: Boolean,
                file: Boolean,
                digital: Boolean,
                original: Boolean
            },
            destroy: Boolean,
            approval: Boolean,
            lending: {
                voucher: Boolean,
                contract: Boolean,
                file: Boolean
            }
        }
    });

    return {
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

function batchSaveFigures(docs, callback) {
    var counter = {count: 0};
    var error = [];
    debug('there are %d rows to add.', docs.length);
    for (var i = 0; i < docs.length; i++) {
        counter.count++;
        save('figure', {id: docs[i].id}, docs[i],
            function(err) {
                if (err) {
                    error.push(err);
                }
                debug('a row of figures was saved to db');
                counter.count--;
                if (!counter.count) {
                    callback(error.length ? error : undefined,
                            docs.length - error.length);
                }
            });
    }
}

module.exports = {
    query: query,
    queryOne: queryOne,
    save: save,
    remove: remove,
    count: count,
    getAccount: getAccount,
    batchSaveFigures: batchSaveFigures
};