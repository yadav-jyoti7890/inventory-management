exports.up = function (knex) {
  return knex.schema.alterTable('product', table => {
    table.renameColumn('saleing_price', 'price');
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable('product', table => {
    table.renameColumn('price', 'saleing_price');
  });
};
