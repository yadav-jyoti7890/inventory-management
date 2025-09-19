// backend/models/categoryModel.js
const db = require("../config/dbConnection");

const CategoryModel = {
  create: (categoryName, callback) => {
    const sql = `INSERT INTO category (name) VALUES (?)`;
    db.query(sql, [categoryName], callback);
  },

  findAll: (callback) => {
    const sql = `SELECT * FROM category`;
    db.query(sql, callback);
  },

  findById: (id, callback) => {
    const sql = `SELECT * FROM category WHERE category_id = ?`;
    db.query(sql, [id], callback);
  },

  update: (id, categoryName, callback) => {
    const sql = `UPDATE category SET name = ? WHERE category_id = ?`;
    db.query(sql, [categoryName, id], callback);
  },

  delete: (id, callback) => {
    const sql = `DELETE FROM category WHERE category_id = ?`;
    db.query(sql, [id], callback);
  },

  checkCategoryUsedInProduct: (id, callback) => {
    const sql = `SELECT * FROM product WHERE category_id = ?`;
    db.query(sql, [id], callback);
  },

  searchByName: (searchValue, callback) => {
    const sql = `SELECT * FROM category WHERE name LIKE ?`;
    db.query(sql, [`%${searchValue}%`], callback);
  },

  getAllCategoriesCount: (callback) => {
    const sql = `SELECT COUNT(*) AS categoryCount FROM category`;
    db.query(sql, callback);
  },

  getAllCategoryBySorting: (searchValue, page, pageSize, sortBy, sortOrder, callback) => {
    const limit = parseInt(pageSize) || 5;
    const pageNumber = Math.max(parseInt(page) || 1, 1);
    const offset = (pageNumber - 1) * limit;
    console.log(searchValue, page, pageSize, sortBy, sortOrder);
    

    const allowedSortBy = ['name', 'create_at', 'update_at'];
    const allowedSortOrder = ['ASC', 'DESC'];

    const orderByColumn = allowedSortBy.includes(sortBy) ? sortBy : 'name';
    const orderByDirection = allowedSortOrder.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    const searchQuery = searchValue ? `%${searchValue}%` : '%';

    const sql = `
    SELECT * FROM category
    WHERE name LIKE ?
    ORDER BY ${orderByColumn} ${orderByDirection}
    LIMIT ? OFFSET ?
  `;

    const sqlCount = `
    SELECT COUNT(*) AS totalCategories
    FROM category
    WHERE name LIKE ?
  `;

    db.query(sql, [searchQuery, limit, offset], (err, results) => {
      if (err) return callback(err);

      db.query(sqlCount, [searchQuery], (countErr, countResult) => {
        if (countErr) return callback(countErr);

        const totalRecords = countResult[0].totalCategories;
        const totalPages = Math.ceil(totalRecords / limit);

        callback(null, {
          category: results,
          totalRecords,
          totalPages,
          currentPage: pageNumber,
        });
      });
    });
  }

}

module.exports = CategoryModel;
