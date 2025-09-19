exports.up = function (knex) {
  return knex.schema.createTable('vendors', table => {
    table.increments('id').unsigned().primary();
    table.string('name', 100);
    table.string('contact', 10);
    table.string('address', 200);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw("'0000-00-00 00:00:00'"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('vendors');
};
