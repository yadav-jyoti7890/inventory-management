exports.up = function (knex) {
  return knex.schema.createTable('product', table => {
    table.increments('id').unsigned().primary();
    table.string('name', 100);
    table.text('image');
    table.integer('category_id').unsigned().references('category_id').inTable('category');
    table.integer('quantity').unsigned();
    table.string('description', 200).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.raw("'0000-00-00 00:00:00'"));
    table.decimal('price', 10, 2);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('product');
};
