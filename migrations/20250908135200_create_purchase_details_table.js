exports.up = function (knex) {
  return knex.schema.createTable('purchase_details', table => {
    table.increments('id').unsigned().primary();
    table.integer('purchase_id').unsigned().references('id').inTable('purchase');
    table.integer('product_id').unsigned().references('id').inTable('product');
    table.integer('quantity');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw("'0000-00-00 00:00:00'"));
    table.integer('price').unsigned();
    table.integer('total').unsigned();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('purchase_details');
};

