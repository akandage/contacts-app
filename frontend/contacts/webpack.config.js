const config = require('../common/webpack.config');
const path = require('path');

config.entry = [
    path.resolve(__dirname, 'contacts.js')
];
config.output.filename = 'contactsBundle.js';

module.exports = config;