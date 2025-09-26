exports.up = function (knex) {
  return knex.schema.createTable('payments', function (table) {
    table.increments('id').primary();

    // Relations
    table.integer('order_id').unsigned(); 
    table.integer('user_id').unsigned(); 

    // Payment details
    table.decimal('amount', 10, 2);
    table.enu('method', ['Cash', 'Card', 'UPI', 'Bank Transfer']);
    table.enu('status', ['Paid', 'Pending', 'Partial', 'Refunded']).defaultTo('Pending'); 
    table.text('notes');
    table.timestamp('payment_date').defaultTo(knex.fn.now()); 

    // Foreign keys
    table.foreign('order_id').references('id').inTable('orders');
    table.foreign('user_id').references('id').inTable('users');

    // Tracking columns
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('payments');
};
