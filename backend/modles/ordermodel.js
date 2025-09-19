const db = require("../config/dbConnection");

const OrderModel = {
    // ✅ Check if user exists
    checkUserExistsAsync: (user_id, connection) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM users WHERE id = ?', [user_id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    // ✅ Check if product exists
    checkProductExistsAsync: (product_id, connection) => {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM product WHERE id = ?', [product_id], (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    },

    // ✅ Create order
    createOrderAsync: (user_id, total_item, totalAmount, connection) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO orders (user_id, total_item, total_amount) VALUES (?, ?, ?)',
                [user_id, total_item, totalAmount],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    },

    // ✅ Create order detail
    createOrderDetailAsync: (data, connection) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO order_details (order_id, product_id, price, quantity, total) VALUES (?, ?, ?, ?, ?)',
                [data.order_id, data.product_id, data.price, data.quantity, data.total],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    },

    // ✅ Insert stock log
    insertStockLogAsync: (data, connection) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO stock_log_table (product_id, stock_quantity, type) VALUES (?, ?, ?)',
                [data.product_id, data.stock_quantity, data.type],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    },

    // ✅ Update product stock
    updateProductStockAsync: (product_id, quantity, connection) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'UPDATE product SET quantity = quantity - ? WHERE id = ?',
                [quantity, product_id],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    },

    // Optional: other existing callback-based methods
    findAll: (callback) => {
        db.query('SELECT * FROM orders', callback);
    },

    //❌
    delete: (id, callback) => {
        db.query('DELETE FROM orders WHERE id = ?', [id], callback);
    },

    getTotalTodayOrders: (callback) => {
        const currentDate = new Date();
        const query = `
    SELECT COUNT(*) AS totalTodayOrders
    FROM orders
    WHERE DATE(created_at) = CURDATE()
  `;

        db.query(query, callback)

    },

    getTotalOrders: (callback) => {
        let sql = `select count(*) as totalOrders from orders`
        db.query(sql, callback)
    }
};

module.exports = OrderModel;
