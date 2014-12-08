'use strict';

var express = require('express');
var status = require('handler/status');
var agent = require('agent');
var config = require('config');

var app = express();
app.use('/status', status);

var server = app.listen(config.server.port, function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

agent.start(config.agent);