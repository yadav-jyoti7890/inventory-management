exports.up = function (knex) {
  return knex.schema.createTable('stock_log_table', table => {
    table.increments('id').unsigned().primary();
    table.integer('product_id').unsigned().references('id').inTable('product');
    table.dateTime('purchase_date');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.integer('stock_quantity');
    table.enu('type', ['purchase', 'sale', 'defect']);
    table.timestamp('updated_at').defaultTo(knex.raw("'0000-00-00 00:00:00'"));
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('stock_log_table');
};
