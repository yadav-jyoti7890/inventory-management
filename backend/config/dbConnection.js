const mySql = require("mysql");

const db = mySql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "inventory_management",
});

db.getConnection((err) => {
  if (err) {
    console.log("mySql not connect");
  } else {
    console.log("connect");
  }
});

module.exports = db;
