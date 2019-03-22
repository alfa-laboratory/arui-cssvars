const scan = require('./cssvars.js');

const ROOT = process.argv[2] || 'src';

scan(ROOT);
