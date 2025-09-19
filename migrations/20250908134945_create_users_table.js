exports.up = function (knex) {
  return knex.schema.createTable('users', table => {
    table.increments('id').unsigned().primary();
    table.string('name', 100).notNullable();
    table.string('email', 100).notNullable().unique();
    table.string('contact', 10).notNullable();
    table.string('address', 200).notNullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('users');
};
