const config = require('../common/webpack.config');
const path = require('path');

config.entry = [
    path.resolve(__dirname, 'signup.js')
];
config.output.filename = 'signupBundle.js';

module.exports = config;