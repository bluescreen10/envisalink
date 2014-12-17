'use strict';

var bunyan = require('bunyan');

var ringBuffer = new bunyan.RingBuffer({
  limit: 50
});

var logger = bunyan.createLogger({
  name: 'app',
  streams: [{
    level: 'debug',
    path: 'envisalink.log'
  }, {
    level: 'info',
    type: 'raw',
    stream: ringBuffer
  }]
});

logger.lastEntries = ringBuffer;

module.exports = logger;