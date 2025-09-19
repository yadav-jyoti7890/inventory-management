exports.up = function (knex) {
  return knex.schema.table('purchase', table => {
    table.string('invoice_number').unique();
  });
};

exports.down = function (knex) {
  return knex.schema.table('purchase', table => {
    table.dropColumn('invoice_number');
  });
};
