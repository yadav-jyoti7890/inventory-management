exports.up = function (knex) {
  return knex.schema.createTable('orders', table => {
    table.increments('id').unsigned().primary();
    table.integer('user_id').unsigned().references('id').inTable('users');
    table.integer('total_item').unsigned();
    table.integer('total_amount');
    table.dateTime('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('orders');
};
