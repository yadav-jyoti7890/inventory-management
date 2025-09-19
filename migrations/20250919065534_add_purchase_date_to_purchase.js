exports.up = function (knex) {
  return knex.schema.table('purchase', table => {
    table.dateTime('purchase_date'); // no default
  });
};

exports.down = function (knex) {
  return knex.schema.table('purchase', table => {
    table.dropColumn('purchase_date');
  });
};
