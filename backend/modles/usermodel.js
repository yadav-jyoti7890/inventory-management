const db = require("../config/dbConnection");

const UserModel = {
  create: (userData, callback) => {
    const { name, email, contact, address } = userData;
    db.query(
      "INSERT INTO users (name, email, contact, address) VALUES (?,?,?,?)",
      [name, email, contact, address],
      callback
    );
  },

  findAll: (searchValue, page, pageSize, sortBy, sortOrder, callback) => {
    const limit = parseInt(pageSize) || 5;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNumber - 1) * limit;
    console.log(searchValue, page, pageSize, sortBy, sortOrder);


    const allowedSortBy = ['name', 'email', 'address'];
    const allowedSortOrder = ['ASC', 'DESC'];

    const orderByColumn = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const orderByDirection = allowedSortOrder.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const searchQuery = searchValue ? `%${searchValue}%` : '%';

    const sql = `
    SELECT * FROM users
    WHERE name LIKE ?
    ORDER BY ${orderByColumn} ${orderByDirection}
    LIMIT ? OFFSET ?
  `;

    const sqlCount = `
    SELECT COUNT(*) AS totalCategories
    FROM users
    WHERE name LIKE ?
  `;

    db.query(sql, [searchQuery, limit, offset], (err, results) => {
      if (err) return callback(err);

      db.query(sqlCount, [searchQuery], (countErr, countResult) => {
        if (countErr) return callback(countErr);

        const totalRecords = countResult[0].totalCategories;
        const totalPages = Math.ceil(totalRecords / limit);

        callback(null, {
          users: results,
          totalRecords,
          totalPages,
          currentPage: pageNumber,
        });
      });
    });
  },

  findById: (id, callback) => {
    db.query("SELECT * FROM users WHERE id = ?", [id], callback);
  },

  update: (id, userData, callback) => {
    const { name, email, contact, address } = userData;
    db.query(
      "UPDATE users SET name = ?, email = ?, contact = ?, address = ? WHERE id = ?",
      [name, email, contact, address, id],
      callback
    );
  },

  findUser: (id, callback) => {
    db.query("SELECT * FROM orders WHERE id = ?", [id], callback);
  },

  delete: (id, callback) => {
    db.query("DELETE FROM users WHERE id = ?", [id], callback);
  },

  totalUserCount: (callback) => {
    const query = "SELECT COUNT(*) AS count FROM users";
    db.query(query, (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  },

  getSelectedData: (value, offset, callback) => {
    const query = `SELECT *
FROM users
ORDER BY id ASC
LIMIT ? OFFSET ?`;
    db.query(query, [value, offset], callback);
  }


};

module.exports = UserModel;
