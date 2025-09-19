exports.up = function (knex) {
  return knex.schema.createTable('purchase', table => {
    table.increments('id').unsigned().primary();
    table.integer('vendors_id').unsigned().references('id').inTable('vendors');
    table.dateTime('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.decimal('total_amount', 10, 2);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('purchase');
};
