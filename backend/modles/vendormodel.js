const db = require("../config/dbConnection");

const VendorModel = {
  create: (vendorData, callback) => {
    const { name, contact, address } = vendorData;
    const sql = `INSERT INTO vendors (name, contact, address) VALUES (?,?,?)`;
    db.query(sql, [name, contact, address], callback);
  },

    findAll: (searchValue, page, pageSize, sortBy, sortOrder, callback) => {
      const limit = parseInt(pageSize) || 5;
      const pageNumber = Math.max(parseInt(page) || 1, 1);
      const offset = (pageNumber - 1) * limit;
      // console.log(searchValue, page, pageSize, sortBy, sortOrder);
      
  
      const allowedSortBy = ['name', 'email', 'address'];
      const allowedSortOrder = ['ASC', 'DESC'];
  
      const orderByColumn = allowedSortBy.includes(sortBy) ? sortBy : 'name';
      const orderByDirection = allowedSortOrder.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
  
      const searchQuery = searchValue ? `%${searchValue}%` : '%';
  
      const sql = `
      SELECT * FROM vendors
      WHERE name LIKE ?
      ORDER BY ${orderByColumn} ${orderByDirection}
      LIMIT ? OFFSET ?
    `;
  
      const sqlCount = `
      SELECT COUNT(*) AS totalVendors
      FROM vendors
      WHERE name LIKE ?
    `;
  
      db.query(sql, [searchQuery, limit, offset], (err, results) => {
        if (err) return callback(err);
  
        db.query(sqlCount, [searchQuery], (countErr, countResult) => {
          if (countErr) return callback(countErr);
  
          const totalRecords = countResult[0].totalVendors;
          const totalPages = Math.ceil(totalRecords / limit);
  
          callback(null, {
            vendors: results,
            totalRecords,
            totalPages,
            currentPage: pageNumber,
          });
        });
      });
    },
  

  findById: (id, callback) => {
    const sql = `SELECT * FROM vendors WHERE id = ?`;
    db.query(sql, [id], callback);
  },

  update: (id, vendorData, callback) => {
    const { name, contact, address } = vendorData;
    const sql = `UPDATE vendors SET name = ?, contact = ?, address = ? WHERE id = ?`;
    db.query(sql, [name, contact, address, id], callback);
  },

  findVendorById: (id, callback)=>{
   db.query("SELECT * FROM purchase WHERE vendors_id = ?", [id], callback)
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM vendors WHERE id = ?`;
    db.query(sql, [id], callback);
  },

  totalVendorsCount: (callback) => {
    const query = "SELECT COUNT(*) AS count FROM vendors";
    db.query(query, (err, result) => {
      if (err) return callback(err);
      callback(null, result);
    });
  }
};

module.exports = VendorModel;
