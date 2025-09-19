exports.up = function (knex) {
  return knex.schema.createTable('order_details', table => {
    table.increments('id').unsigned().primary();
    table.integer('order_id').unsigned().references('id').inTable('orders');
    table.integer('product_id').unsigned().references('id').inTable('product');
    table.integer('price').unsigned();
    table.integer('quantity').unsigned();
    table.integer('total').unsigned();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('order_details');
};
