const knex = appRequire('init/knex').knex;
const manager = appRequire('services/manager');
const checkAccount = appRequire('plugins/account/checkAccount');
const config = appRequire('services/config').all();

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