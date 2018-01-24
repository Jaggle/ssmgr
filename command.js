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

//const manager = require('./services/manager');


const initDb = require('./init/loadModels').init;

const knex = appRequire('init/knex').knex;
const email = appRequire('plugins/email/index');

const sendMail = async  () => {
  const allEmail = await knex('user').select(['email']);
  const notice = await knex('email_notice').select();
  const title = notice[0].title;
  const content = notice[0].content;

  let index = 0;
  let interval = setInterval(() => {
    if (index < allEmail.length) {
      let _email = allEmail[index++];
      email.sendMail(_email.email, title, content, {
        type: 'email-notice',
      });
      console.log('send email for: ' + _email.email);
    } else {
      clearInterval(interval);
      console.log('finished!');
    }
  }, 3000);

};
initDb();
sendMail();


// manager.send({command: 'version'}, {
//     host: '45.32.123.118',
//     port: 4001,
//     password: '1991JakeSS`'
// }).then(success => {
//     console.log(success);
// });


// manager.send({command: 'add', port: 29756, password: '9432229077'}, {
//     host: 'hk1.v.greentern.net',
//     port: 4001,
//     password: '1991JakeSS`'
// }).then(success => {
//     console.log(success);
// });


