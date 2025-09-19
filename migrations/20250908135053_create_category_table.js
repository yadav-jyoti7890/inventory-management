exports.up = function (knex) {
  return knex.schema.createTable('category', table => {
    table.increments('category_id').unsigned().primary();
    table.string('name', 100).unique();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw("'0000-00-00 00:00:00'"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('category');
};
