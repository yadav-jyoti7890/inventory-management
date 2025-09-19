exports.up = function (knex) {
  return knex.schema.table('purchase', table => {
    table.string('invoice_number').unique().after('id'); 
    // .after('id') works in MySQL. If you’re on PostgreSQL, remove .after('id')
  });
};

exports.down = function (knex) {
  return knex.schema.table('purchase', table => {
    table.dropColumn('invoice_number');
  });
};
