exports.up = async function (knex) {
  // First drop the unique index if it exists
  await knex.schema.alterTable('users', function (table) {
    table.dropUnique(['email']); // removes users_email_unique
  });

  // Then alter columns
  return knex.schema.alterTable('users', function (table) {
    table.string('name', 100).nullable().alter();
    table.string('email', 100).nullable().alter();
    table.string('contact', 10).nullable().alter();
    table.string('address', 200).nullable().alter();
  });
};

exports.down = async function (knex) {
  // Revert back: make fields not null and restore unique
  await knex.schema.alterTable('users', function (table) {
    table.string('name', 100).notNullable().alter();
    table.string('email', 100).notNullable().unique().alter(); // add unique back
    table.string('contact', 10).notNullable().alter();
    table.string('address', 200).notNullable().alter();
  });
};
