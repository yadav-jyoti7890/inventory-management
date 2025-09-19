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
    console.log(purchase_id, product_id, quantity, price, total); 
    const sql = `INSERT INTO purchase_details(purchase_id, product_id, quantity, price, total) VALUES (?,?,?,?,?)`;
    connection.query(sql, [purchase_id, product_id, quantity, price, total], callback);
  },

  // Insert stock log
  insertStockLog: (connection, logData, callback) => {
    const { product_id, stock_quantity, type } = logData;
    const sql = `INSERT INTO stock_log_table (product_id, stock_quantity, type) VALUES (?,?,?)`;
    connection.query(sql, [product_id, stock_quantity, type], callback);
  },

  // Update product stock
  updateProductStock: (connection, productId, quantity, callback) => {
    const sql = `UPDATE product SET quantity = quantity + ? WHERE id = ?`;
    connection.query(sql, [quantity, productId], callback);
  },

  // Get all purchases 
  findAll: (callback) => {
    const sql = `SELECT 
    p.id AS purchase_id,
    v.id AS vendors_id,
    pr.id AS product_id,
    p.invoice_number as invoice_number,
    v.name AS vendor_name,
    pr.name AS product_name,
    pd.quantity,
    pd.price,
    p.created_at AS purchase_date,
    p.total_amount
FROM purchase p
INNER JOIN vendors v 
    ON p.vendors_id = v.id
INNER JOIN purchase_details pd 
    ON p.id = pd.purchase_id
INNER JOIN product pr 
    ON pd.product_id = pr.id`;
    db.query(sql, callback);
  },

  // Update purchase
  // update: (connection, id, vendorId, callback) => {
  //   const sql = `UPDATE purchase SET vendors_id = ? WHERE id = ?`;
  //   connection.query(sql, [vendorId, id], callback);
  // },

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
    const sql = `SELECT name,id FROM product`;
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
INNER JOIN vendors v 
    ON p.vendors_id = v.id
INNER JOIN purchase_details pd 
    ON p.id = pd.purchase_id
INNER JOIN product pr 
    ON pd.product_id = pr.id
WHERE p.id = ?`;
    db.query(sql, [id], callback);
  },

  deletePurchaseDetailsData: (connection, id, callback) => {
    console.log(id, "purchase id");
    
    const sql = `DELETE FROM purchase_details WHERE purchase_id = ?`;
    connection.query(sql, [id], callback)
  }
};

module.exports = PurchaseModel;
