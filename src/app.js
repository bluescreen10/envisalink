'use strict';

// Hack to get modules loaded -------------
process.env.NODE_PATH = __dirname + '/api';
require('module').Module._initPaths();
// ----------------------------------------

var express = require('express');
var status = require('handler/status');
var agent = require('agent');
var config = require('config');

var app = express();

app.use('/', express.static( __dirname + '/ui'));

app.use('/status', status);

var server = app.listen(config.server.port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

agent.start(config.agent);