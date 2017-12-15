const knex = appRequire('init/knex').knex;
const manager = appRequire('services/manager');
const checkAccount = appRequire('plugins/account/checkAccount');
const config = appRequire('services/config').all();
const emailService = appRequire('plugins/email/index');

exports.addInviteUser = async (account) => {
  const invite_code = account.port * 100 + 569519;
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
    add_days: 7
  });

  const a = await knex('account_plugin').select().where({port: from_port}).then(success => {
    if (success.length) {
      return success[0];
    }
  });

  let accountData = JSON.parse(a.data), create, limit;
  if (parseInt(accountData.create) + parseInt(accountData.limit*24*60*60*1000) < parseInt(Date.now())) {
    create = parseInt(Date.now());
    limit= 7;
  } else {
    create = accountData.create;
    limit = accountData.limit + 7;
  }

  await knex('account_plugin').update({
      data: JSON.stringify({
        create: create,
        flow: accountData.flow + 0,
        limit: limit,
      }),
    }).where({port: from_port});

  await emailService.sendAccountExpiredMail(a, '用户 '+email+' 通过您的邀请码注册，因此您获得7天的免费会员！感谢您为绿灯做出的贡献！'
      + "\n\n https://www.greentern.net");

  return true;
};