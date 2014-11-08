#!/usr/bin/env node
var debug = require('debug')('expressTest');
var app = require('../app');

// get service TCP port from configuration
var port = require('../config').port;

app.set('port', process.env.PORT || port || 3000);

var server = app.listen(app.get('port'), function() {
  debug('Express server listening on port ' + server.address().port);
});
