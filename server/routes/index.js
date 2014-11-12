var express = require('express');
var router = express.Router();

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
var districtId = '431103';

/* get district info */
router.get('/district', function(req, res) {
  res.send({status: 'ok', district: district, districtId: districtId});
});

/* GET home page. */
router.get('/test', function(req, res) {
  res.render('error', { message: 'Express', error: {} });
});

module.exports = router;
