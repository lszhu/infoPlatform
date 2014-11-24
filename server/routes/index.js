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

/* get district info */
router.get('/district', function(req, res) {
    res.send({status: 'ok', district: district, districtId: districtId});
});

/* save message posted by employer */
router.post('/postEmployer', function(req, res) {
    res.send({status: 'ok'});
});

/* save message posted by job hunter */
router.post('/postEmployee', function(req, res) {
    res.send({status: 'ok'});
});

/* save organization introduction posted by organization */
router.post('/postOrgInfo', function(req, res) {
    res.send({status: 'ok'});
});

/* save suggestion submitted by adviser */
router.post('/postSuggestion', function(req, res) {
    res.send({status: 'ok'});
});

/* GET clause page. */
//router.get('/etc/clause', function(req, res) {
//  res.sendFile(path.join(__dirname, '../../app/etcView/clause.html'));
//});

module.exports = router;
