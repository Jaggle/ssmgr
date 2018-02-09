const knex = appRequire('init/knex').knex;
const manager = appRequire('services/manager');
const config = appRequire('services/config').all();
const emailService = appRequire('plugins/email/index');

exports.addInviteUser = async (account) => {
  const invite_code = account.port * 123 + 569519;
  await knex('invite_user').insert({
    port: account.port,
    code: invite_code,
    type: 1
  });

  return {
    port: account.port,
    code: invite_code,
    type: 1
  }
};

exports.getInviteRecords = async (fromPort) => {
  return  await knex('invite_record').select('*').where({'from_port':fromPort}).then(success => {
    return success;
  });
};

exports.handleInvite = async (code, email, to_port) => {
  if (!code) return false;
  email = email.substr(0, 3) + '****' + email.substr(-3, 3);
  const inviteUser = await knex('invite_user').where({code:code}).then(success => {
    if (success.length) {
      return success[0];
    }
  });

  if (!inviteUser) {
    return false;
  }

  const from_port = inviteUser.port;

  await knex('invite_record').insert({
    code: code,
    type: 1,
    message: '邀请用户 '+email+' 注册',
    from_port: from_port,
    to_port: to_port,
    time: parseInt(Date.now()),
    add_days: 0
  });

  // const a = await knex('account_plugin').select().where({port: from_port}).then(success => {
  //   if (success.length) {
  //     return success[0];
  //   }
  // });

  // let accountData = JSON.parse(a.data), create, limit;
  // if (parseInt(accountData.create) + parseInt(accountData.limit*24*60*60*1000) < parseInt(Date.now())) {
  //   create = parseInt(Date.now());
  //   limit= 3;
  // } else {
  //   create = accountData.create;
  //   limit = accountData.limit + 3;
  // }

  // const updateRes = await knex('account_plugin').update({
  //     data: JSON.stringify({
  //       create: create,
  //       flow: accountData.flow + 0,
  //       limit: limit,
  //     }),
  //   }).where({port: from_port});

  // await emailService.sendAccountExpiredMail(a, '用户 '+email+' 通过您的邀请码注册，因此您获得3天的免费会员！感谢您为绿灯做出的贡献！'
  //     + "\n\n");

  return true;
};

exports.handleInvitePay = async (toPort, addDays) => {
  const inviteRecord =  await knex('invite_record').select('*').where({
    to_port:toPort,
    type: 1
  }).then(success => {
    if (success.length) {
      return success[0];
    }
  });

  if (!inviteRecord) {
    return false;
  }

  const toUser = await knex('account_plugin').select().where({port: toPort}).then(success => {
    return success[0];
  }).then(success => {
    return knex('user').select().where({ id: success.userId }).then(success => {
      return success[0]
    });
  });

  let toEmail = toUser.email;
  toEmail = toEmail.substr(0, 3) + '****' + toEmail.substr(-3, 3);

  const fromPort = inviteRecord.from_port;
  const a =  await knex('account_plugin').select().where({port: fromPort}).then(success => {
    if (success.length) {
      return success[0];
    }
  });

  if (!a) {
    return false;
  }

  let accountData = JSON.parse(a.data), create, limit;
  if (parseInt(accountData.create) + parseInt(accountData.limit*24*60*60*1000) < parseInt(Date.now())) {
    create = parseInt(Date.now());
    limit= addDays;
  } else {
    create = accountData.create;
    limit = accountData.limit + addDays;
  }

  await knex('account_plugin').update({
    data: JSON.stringify({
      create: create,
      flow: accountData.flow,
      limit: limit,
    }),
  }).where({port: fromPort});

  await knex('invite_record').insert({
    code: inviteRecord.code,
    type: 2,
    message: '邀请的用户 '+toEmail+' 续费',
    from_port: fromPort,
    to_port: toPort,
    time: parseInt(Date.now()),
    add_days: addDays
  });

  await emailService.sendAccountExpiredMail(a, '用户 '+toEmail+' 通过您的邀请码注册并且续费, 因此您获得该用户续费天数的1/6, 即'+addDays+'天的免费会员！感谢您为绿灯做出的贡献！'
      + "\n\n");

  return true;
};