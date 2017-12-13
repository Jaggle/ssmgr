if(process.env.NODE_ENV !== 'production') {
  console.log('use babel-core/register');
  require('babel-core/register');
}

require('./init/log');

const log4js = require('log4js');
const logger = log4js.getLogger('system');

process.on('unhandledRejection', (reason, p) => {
  logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error(`Caught exception: ${err}`);
});

require('./init/utils');

require('./init/moveConfigFile');
require('./init/checkConfig');
require('./init/knex');
const manager = require('./services/manager');

// manager.send({command: 'version'}, {
//     host: '45.32.123.118',
//     port: 4001,
//     password: '1991JakeSS`'
// }).then(success => {
//     console.log(success);
// });


manager.send({command: 'add', port: 29756, password: '9432229077'}, {
    host: 'hk1.v.greentern.net',
    port: 4001,
    password: '1991JakeSS`'
}).then(success => {
    console.log(success);
});
