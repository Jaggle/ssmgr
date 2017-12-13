const knex = appRequire('init/knex').knex;
const tableName = 'invite_user';

const createTable = async() => {
    const exist = await knex.schema.hasTable(tableName);
    if(exist) {
        return;
    }
    return knex.schema.createTableIfNotExists(tableName, function(table) {
        table.increments('id').primary();
        table.string('port');
        table.string('code');
        table.string('type');
    });
};

exports.createTable = createTable;
