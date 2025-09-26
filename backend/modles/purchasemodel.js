const db = require("../config/dbConnection");

const PurchaseModel = {

  // Check vendor exists
  checkVendorExists: (connection, vendorId, callback) => {
    const sql = `SELECT * FROM vendors WHERE id = ?`;
    connection.query(sql, [vendorId], callback);
  },

  // Check product exists
  checkProductExists: (connection, productId, callback) => {
    const sql = `SELECT * FROM product WHERE id = ?`;
    connection.query(sql, [productId], callback);
  },

  // Insert purchase
  createPurchase: (connection, vendorId, totalAmount, purchaseDate, callback) => {
    const sql = `INSERT INTO purchase(vendors_id, total_amount, purchase_date) VALUES (?,?,?)`;
    connection.query(sql, [vendorId, totalAmount, purchaseDate], callback);
  },

  // Insert purchase details
  createPurchaseDetail: (connection, detailData, callback) => {
    const { purchase_id, product_id, quantity, price, total } = detailData;
    console.log(detailData, "detailData");

    const sql = `INSERT INTO purchase_details(purchase_id, product_id, quantity, price, total) VALUES (?,?,?,?,?)`;
    connection.query(sql, [purchase_id, product_id, quantity, price, total], callback);
  },
  
  updatePurchaseQuantity: (connection, grandTotal, purchaseId, callback) => {
    const sql = `UPDATE purchase SET total_amount = ? WHERE id = ?`;
    connection.query(sql, [grandTotal, purchaseId], callback);
  },

  // Insert stock log
  insertStockLog: (connection, logData, callback) => {
    const { product_id, stock_quantity, type, activity, purchase_id } = logData;
    console.log(logData, "logData");
    const sql = `INSERT INTO stock_log_table (product_id, stock_quantity, type, activity, purchase_id) VALUES (?,?,?,?,?)`;
    connection.query(sql, [product_id, stock_quantity, type, activity, purchase_id], callback);
  },

  // Update product stock
  updateProductStock: (connection, productId, quantity, callback) => {
    const sql = `UPDATE product SET quantity = quantity + ? WHERE id = ?`;
    connection.query(sql, [quantity, productId], callback);
  },

  findAll: (searchValue, limit, page, sortBy, sortOrder, callback) => {
    const pageSize = parseInt(limit) || 5;
    const currentPage = parseInt(page) || 1;
    const offset = (currentPage - 1) * pageSize;
    const allowedSortBy = ['p.id', 'p.invoice_number', 'v.name', 'p.created_at', 'p.total_amount'];
    const allowedSortOrder = ['ASC', 'DESC'];

    const orderByColumn = allowedSortBy.includes(sortBy) ? sortBy : 'p.id';
    const orderByDirection = allowedSortOrder.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const searchQuery = `%${searchValue}%`;

    // Proper GROUP BY and safe parentheses
    const sql = `
    SELECT 
      p.id AS purchase_id,
      v.id AS vendors_id,
      p.invoice_number,
      v.name AS vendor_name,
      p.created_at AS purchase_date,
      p.total_amount,
      GROUP_CONCAT(pr.name SEPARATOR ', ') AS products
    FROM purchase p
    INNER JOIN vendors v ON p.vendors_id = v.id
    INNER JOIN purchase_details pd ON p.id = pd.purchase_id
    INNER JOIN product pr ON pd.product_id = pr.id
    WHERE (v.name LIKE ? OR p.invoice_number LIKE ?)
    GROUP BY p.id
    ORDER BY ${orderByColumn} ${orderByDirection}
    LIMIT ? OFFSET ?
  `;

    const sqlCount = `
    SELECT COUNT(DISTINCT p.id) AS totalRecords
    FROM purchase p
    INNER JOIN vendors v ON p.vendors_id = v.id
    INNER JOIN purchase_details pd ON p.id = pd.purchase_id
    INNER JOIN product pr ON pd.product_id = pr.id
    WHERE (v.name LIKE ? OR p.invoice_number LIKE ?)
  `;

    db.query(sql, [searchQuery, searchQuery, pageSize, offset], (err, results) => {
      if (err) return callback(err);

      db.query(sqlCount, [searchQuery, searchQuery], (countErr, countResult) => {
        if (countErr) return callback(countErr);

        const totalRecords = countResult[0].totalRecords;
        const totalPages = Math.ceil(totalRecords / pageSize);

        callback(null, {
          purchases: results,
          totalRecords,
          totalPages,
          currentPage
        });
      });
    });
  },

  // Delete purchase
  delete: (connection, id, callback) => {
    const sql = `DELETE FROM purchase WHERE id = ?`;
    connection.query(sql, [id], callback);
  },

  getVendors: (callback) => {
    const sql = `SELECT name,id FROM vendors`;
    db.query(sql, callback);
  },

  getProducts: (callback) => {
    const sql = `SELECT name,id, price, quantity FROM product`;
    db.query(sql, callback);
  },

  getPurchaseDataById: (id, callback) => {
    const sql = `SELECT 
      p.id AS purchase_id,
      p.invoice_number as invoice_number,
      v.id AS vendors_id,
      pr.id AS product_id,
      v.name AS vendor_name,
      pr.name AS product_name,
      pd.quantity,
      pd.price,
      pd.total,
      p.created_at AS purchase_date,
      p.total_amount
    FROM purchase p
    INNER JOIN vendors v ON p.vendors_id = v.id
    INNER JOIN purchase_details pd ON p.id = pd.purchase_id
    INNER JOIN product pr ON pd.product_id = pr.id
    WHERE p.id = ?`;
    db.query(sql, [id], callback);
  },

  deletePurchaseDetailsData: (connection, id, callback) => {
    const sql = `DELETE FROM purchase_details WHERE purchase_id = ?`;
    connection.query(sql, [id], callback);
  },

  getStockDataById: (connection, id, callback) => {
    const sql = `SELECT * FROM stock_log_table WHERE product_id = ?`;
    connection.query(sql, [id], callback);
  },

  updateProductQuantityFromStockLog: (connection, productId, callback) => {
    const sql = `UPDATE product p
                 SET p.quantity = (SELECT IFNULL(SUM(stock_quantity),0) 
                                   FROM stock_log_table 
                                   WHERE product_id = ?)
                 WHERE p.id = ?`;
    connection.query(sql, [productId, productId], callback);
  },

  getTodayPurchase: (callback) => {
    const sql = `
      SELECT COUNT(*) AS totalTodayPurchase
    FROM purchase
    WHERE DATE(created_at) = CURDATE()`;
    db.query(sql, callback);
  },

  getTotalPurchase: (callback) => {
    const sql = `select count(*) as totalPurchase from purchase`;
    db.query(sql, callback);
  },

};

module.exports = PurchaseModel;
