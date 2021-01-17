const config = require('../common/webpack.config');
const path = require('path');

config.entry = [
    path.resolve(__dirname, 'login.js')
];
config.output.filename = 'loginBundle.js';

module.exports = config;