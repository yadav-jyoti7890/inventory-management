exports.up = function(knex) {
  return knex.schema.table('stock_log_table', function(table) {
    table.integer('purchase_id').unsigned().notNullable()
      .references('id').inTable('purchase');  // foreign key reference only
  });
};

exports.down = function(knex) {
  return knex.schema.table('stock_log_table', function(table) {
    table.dropColumn('purchase_id');
  });
};
