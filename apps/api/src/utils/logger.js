const util = require('util');

const level = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

function format(args) {
  return args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: 3 }) : a)).join(' ');
}

module.exports = {
  debug: (...args) => { if (['debug'].includes(level)) console.debug(format(args)); },
  info: (...args) => { if (['debug','info'].includes(level)) console.log(format(args)); },
  warn: (...args) => { if (['debug','info','warn'].includes(level)) console.warn(format(args)); },
  error: (...args) => { console.error(format(args)); }
};
