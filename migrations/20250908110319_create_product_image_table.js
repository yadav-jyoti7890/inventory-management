exports.up = function (knex) {
    return knex.schema.createTable('product_image', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.integer('product_id').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('product_image');
};