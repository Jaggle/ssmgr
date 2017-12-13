const knex = appRequire('init/knex').knex;
const tableName = 'invite_record';

const createTable = async() => {
    const exist = await knex.schema.hasTable(tableName);
    if(exist) {
        return;
    }
    return knex.schema.createTableIfNotExists(tableName, function(table) {
        table.increments('id').primary();
        table.string('code');
        table.string('type'); // 1 用户注册，2 用户续费
        table.string('message');
        table.string('from_port'); // 注册人的端口
        table.string('to_port');  // 推广者的端口
        table.string('time');
    });
};

exports.createTable = createTable;
