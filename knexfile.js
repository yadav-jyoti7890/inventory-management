// knexfile.js
module.exports = {
  development: {
    client: "mysql",
    connection: {
      host: "localhost",
      user: "root",
      password: "",
      database: "inventory_management"
    },
    migrations: {
      directory: "./migrations"
    }
  }
};
