const db = require("../config/dbConnection");

const StockModel = {
  getAvailableQty: (callback) => {
    const sql = `SELECT 
      P.id AS product_id,
      P.name AS product_name,
      P.category_id,
      P.image,
      P.quantity AS product_quantity,
      P.description,
      P.price,
      P.created_at AS product_created_at,
      P.updated_at AS product_updated_at,
      
      s.id AS stock_id,
      s.purchase_date,
      s.type AS stock_type,
      s.stock_quantity,
      s.created_at AS stock_created_at,
      s.updated_at AS stock_updated_at
    FROM product AS P
    INNER JOIN stock_log_table AS s
    ON P.id = s.product_id
    ORDER BY P.id`;

    db.query(sql, callback);
  },
};

module.exports = StockModel;
