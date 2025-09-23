
exports.up = function(knex){
    return knex.schema.table('stock_log_table', table => {
     table.enu('activity', ['insert', 'update', 'delete']).notNullable().defaultTo('insert');
  }); 
}

exports.down = function (knex) {
  return knex.schema.table('stock_log_table', table => {
    table.dropColumn('activity');
  });
};

