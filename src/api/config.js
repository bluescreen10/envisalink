'use strict';

var fs = require('fs');
var configFile = 'etc/config.json' || process.env.CONFIG_FILE;

module.exports = JSON.parse(fs.readFileSync(configFile, 'utf8'));