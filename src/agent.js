'use strict';

var net = require('net');
var logger = require('logger');

var address, port, password, timer, options, client;

var zoneStatus = {
  ALARM: 0,
  ALARM_OK: 1,
  TAMPER: 2,
  TAMPER_OK: 3,
  FAULT: 4,
  FAULT_OK: 5,
  OPEN: 6,
  OK: 7
};

var zones = {};

function connect() {
  client = net.connect({
    host: address,
    port: port
  });
  client.on('data', handleData);
  client.on('end', handleData);
}

function handleData(buffer) {
  var lines = buffer.toString().split(/\r\n/).filter(function(line) {
    return line.length != 0;
  });

  lines.forEach(function(line) {
    logger.trace('INPUT:' + buffer.toString());

    var checksum = line.slice(-2);
    var calculatedChecksum = calculateChecksum(line.slice(0, -2));

    if (calculatedChecksum === checksum) {
      var command = line.slice(0, 3);
      var params = line.slice(3, -2);
      dispatchCommand(command, params);
    } else {
      logger.error('Invalid Checksum (' + line + ') calculated checksum:' + calculatedChecksum);
      // TODO: err handling
    }
  });
}

function sendCommand(command, data) {

  if (data) {
    command += data;
  }

  var checksum = calculateChecksum(command);
  client.write(command + checksum + '\r\n');
}

function dispatchCommand(command, params) {
  logger.debug('Dispatching command ' + command + '(' + params + ')');

  var handlers = {
    500: handleACK,
    501: handleNAK,
    502: handleSystemError,
    505: handleAuthentication,
    601: handleZoneAlarm,
    602: handleZoneAlarmOK,
    603: handleZoneTamper,
    604: handleZoneTamperOK,
    605: handleZoneFault,
    606: handleZoneFaultOK,
    609: handleZoneOpen,
    610: handleZoneOK
  };

  if (handlers[command]) {
    handlers[command](params);
  } else {
    logger.error('Command ' + command + ' not handled');
  }
}

function handleACK(command) {
  //TODO: Maybe implement promises with commands
}

function handleNAK() {
  //TODO: Maybe implement promises
}

function handleSystemError(error) {
  //TOOD: Better error handling
  logger.fatal('System Error: ' + error);
}

function handleZoneAlarm(zone) {
  if (zones[zone] !== zoneStatus.ALARM) {
    logger.info('Zone ' + zone + ' changed to ALARM');
    zones[zone] = zoneStatus.ALARM;
  }
}

function handleZoneAlarmOK(zone) {
  if (zones[zone] !== zoneStatus.ALARM_OK) {
    logger.info('Zone ' + zone + ' changed to ALARM RESTORED');
    zones[zone] = zoneStatus.ALARM_OK;
  }
}

function handleZoneTamper(zone) {
  if (zones[zone] !== zoneStatus.TAMPER) {
    logger.info('Zone ' + zone + ' changed to TAMPER');
    zones[zone] = zoneStatus.TAMPER;
  }
}

function handleZoneTamperOK(zone) {

  if (zones[zone] !== zoneStatus.TAMPER_OK) {
    logger.info('Zone ' + zone + ' changed to TAMPER RESTORED');
    zones[zone] = zoneStatus.TAMPER_OK;
  }
}

function handleZoneFault(zone) {
  if (zones[zone] !== zoneStatus.FAULT) {
    logger.info('Zone ' + zone + ' changed to FAULT');
    zones[zone] = zoneStatus.FAULT;
  }
}

function handleZoneFaultOK(zone) {
  if (zones[zone] !== zoneStatus.FAULT_OK) {
    logger.info('Zone ' + zone + ' changed to FAULT RESTORED');
    zones[zone] = zoneStatus.FAULT_OK;
  }
}

function handleZoneOpen(zone) {
  if (zones[zone] !== zoneStatus.OPEN) {
    logger.info('Zone ' + zone + ' changed to OPEN');
    zones[zone] = zoneStatus.OPENl
  }
}

function handleZoneOK(zone) {
  if (zones[zone] !== zoneStatus.OK) {
    logger.info('Zone ' + zone + ' changed to OK');
    zones[zone] = zoneStatus.OK;
  }
}

function authenticate() {
  sendCommand('005', password);
}

function handleAuthentication(response) {

  if (response === '0') {
    logger.fatal('Authentication Failed');
  } else if (response === '1') {
    logger.info('Successfully authenticated');
    startTimer();
  } else if (response === '2') {
    logger.error('Timed out');
  } else if (response === '3') {
    authenticate();
  } else {
    logger.fatal('Invalid authentication response ' + response);
  }
}

function startTimer() {
  var interval = options && options.interval ? options.interval : 300000;
  timer = setInterval(handleTimer, interval);
}

function handleTimer() {
  sendCommand('001');
}

function calculateChecksum(buffer) {
  var chars = new String(buffer).split('');
  var checksum = 0;

  chars.forEach(function(each) {
    checksum += each.charCodeAt(0);
  });

  checksum &= 0xFF;
  return ('0' + checksum.toString(16).toUpperCase()).substr(-2);
}

module.exports = {
  start: function(agentOptions) {
    address = agentOptions.host;
    port = agentOptions.port;
    password = agentOptions.password;

    connect();
  },

  stop: function() {
    if (timer) {
      clearInterval(timer);
      timer = undefined;
    }

    if (client) {
      client.end();
      client = undefined;
    }

  }
};