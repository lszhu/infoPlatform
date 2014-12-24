var express = require('express');
var router = express.Router();

// for debug
var debug = require('debug')('user');

/* GET users listing. */
router.post('/', function(req, res) {
    debug('req.body: ' + JSON.stringify(req.body));
    res.send({status: 'ok'});
});

module.exports = router;
