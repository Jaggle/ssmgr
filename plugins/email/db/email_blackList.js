const knex = appRequire('init/knex').knex;
const tableName = 'email_blackList';

const createTable = async() => {
  return knex.schema.createTableIfNotExists(tableName, function(table) {
    table.increments('id').primary();
    table.string('email');
  });
};

exports.createTable = createTable;
