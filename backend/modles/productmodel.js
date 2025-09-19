const db = require("../config/dbConnection");


const ProductModel = {
  create: (productData, callback) => {
    const { name, category_id, image, quantity, description, price } = productData;
    const sql = `INSERT INTO product (name, category_id, image, quantity, description, price) VALUES (?,?,?,?,?,?)`;
    db.query(sql, [name, category_id, image, quantity, description, price], callback);
  },

  findAll: (callback) => {
    const sql = `SELECT * FROM product`;
    db.query(sql, callback);
  },

  getAllProducts: (searchValue, page, pageSize, sortBy, sortOrder, callback) => {
    const limit = parseInt(pageSize) || 5;
    const offset = (parseInt(page) - 1) * limit;

    // Allowed columns and sort order
    const allowedSortBy = ['name', 'category_id', 'quantity', 'description', 'price'];
    const allowedSortOrder = ['ASC', 'DESC'];

    const orderByColumn = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const orderByDirection = allowedSortOrder.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Search query
    const searchQuery = searchValue ? `%${searchValue}%` : '%';

    const sql = `
    SELECT * FROM product
    WHERE name LIKE ?
    ORDER BY ${orderByColumn} ${orderByDirection}
    LIMIT ? OFFSET ?
  `;

    const sqlCount = `
    SELECT COUNT(*) AS totalProducts 
    FROM product
    WHERE name LIKE ? 
  `;

    db.query(sql, [searchQuery, limit, offset], (err, results) => {
      if (err) return callback(err);

      db.query(sqlCount, [searchQuery], (countErr, countResult) => {
        if (countErr) return callback(countErr);

        const totalRecords = countResult[0].totalProducts;
        const totalPages = Math.ceil(totalRecords / limit);

        callback(null, {
          product: results,
          totalRecords,
          totalPages,
          currentPage: parseInt(page),
        });
      });
    });

  },

  findById: (id, callback) => {
    const sql = `SELECT * FROM product WHERE id = ?`;
    db.query(sql, [id], callback);
  },

  getImagesById: (id, callback) => {
    const sql = `select * from product_image where product_id = ?`;
    db.query(sql, [id], callback);
  },

  update: (id, productData, callback) => {
    const { name, category_id, image, quantity, description } = productData;
    const sql = `UPDATE product SET name = ?, category_id = ?, image = ?, quantity = ?, description = ? WHERE id = ?`;
    db.query(sql, [name, category_id, image, quantity, description, id], callback);
  },

  checkProductExistsOnProductImage: (id, callback) => {
    const sql = `SELECT * FROM product_image WHERE product_id = ?`;
    db.query(sql, [id], callback);
  },

  checkProductExistsOnPurchaseDetails: (id, callback) => {
    const sql = `SELECT * FROM purchase_details WHERE product_id = ?`;
    db.query(sql, [id], callback);
  },

  checkProductExistsOnStockLogTable: (id, callback) => {
    const sql = `SELECT * FROM stock_log_table WHERE product_id = ?`;
    db.query(sql, [id], callback);
  },

  checkProductExistsOnOrderDetails: (id, callback) => {
    const sql = `SELECT * FROM order_details WHERE product_id = ?`;
    db.query(sql, [id], callback);
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM product WHERE id = ?`;
    db.query(sql, [id], callback);
  },

  searchByName: (searchTerm, callback) => {
    const sql = `SELECT * FROM product WHERE name LIKE ?`;
    db.query(sql, [`%${searchTerm}%`], callback);
  },

  exactSearch: (searchTerm, callback) => {
    const sql = `SELECT * FROM product WHERE name = ?`;
    db.query(sql, [searchTerm], callback);
  },

  getLowestQuantity: (callback) => {
    const sql = `SELECT * FROM product WHERE quantity < 5`;
    db.query(sql, callback);
  },

  getAllProductsCount: (callback) => {
    const sql = `select count(*) as productCount from product`;
    db.query(sql, callback)
  },

  getAllCategory: (callback) => {
    const sql = `select c.name, c.category_id from category as c inner join  product as p on c.category_id = p.category_id`
    db.query(sql, callback)
  }
};

module.exports = ProductModel;
