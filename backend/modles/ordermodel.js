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
    createOrderAsync: (user_id, totalAmount, connection) => {
        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO orders (user_id,  total_amount) VALUES (?, ?)',
                [user_id, totalAmount],
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
        console.log(data, "insert log table");

        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO stock_log_table (product_id, stock_quantity, type, purchase_id) VALUES (?, ?, ?,?)',
                [data.product_id, data.stock_quantity, data.type, data.purchaseID],
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

    insertPaymentDetailsAsync: (data, connection) => {
        console.log(data);
        let status = '';
        const { order_id, customerId, totalAmount, payment_method, notes, paymentDate } = data;

        if (payment_method === 'Cash') {
            status = 'Pending';
        } else if (['Card', 'UPI', 'Bank Transfer'].includes(payment_method)) {
            status = 'Paid';
        } else {
            status = 'Partial';
        }

        return new Promise((resolve, reject) => {
            connection.query(
                'INSERT INTO payments (order_id, user_id, amount, method, status, notes, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [order_id, customerId, totalAmount, payment_method, status, notes, paymentDate],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    },

    // Optional: other existing callback-based methods
    findAll: (searchValue, limit, page, sortBy, sortOrder, callback) => {
        const pageSize = parseInt(limit) || 5;
        const currentPage = parseInt(page) || 1;
        const offset = (currentPage - 1) * pageSize;

        // Allowed columns for sorting to prevent SQL injection
        const allowedSortBy = ['o.id', 'o.total_amount', 'p.method', 'p.status', 'u.name'];
        const allowedSortOrder = ['ASC', 'DESC'];

        const orderByColumn = allowedSortBy.includes(sortBy) ? sortBy : 'o.id';
        const orderByDirection = allowedSortOrder.includes(sortOrder?.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

        const searchQuery = `%${searchValue}%`;

        // Main query with joins
        const sql = `
      SELECT 
        o.id,
        u.name,
        p.method,
        p.status,
        o.total_amount
      FROM orders o
      INNER JOIN order_details od ON o.id = od.order_id
      INNER JOIN users u ON o.user_id = u.id
      INNER JOIN payments p ON o.id = p.order_id
      WHERE u.name LIKE ? OR p.method LIKE ? OR p.status LIKE ?
      GROUP BY o.id
      ORDER BY ${orderByColumn} ${orderByDirection}
      LIMIT ? OFFSET ?
    `;

        // Count query for pagination
        const sqlCount = `
      SELECT COUNT(DISTINCT o.id) AS totalRecords
      FROM orders o
      INNER JOIN order_details od ON o.id = od.order_id
      INNER JOIN users u ON o.user_id = u.id
      INNER JOIN payments p ON o.id = p.order_id
      WHERE u.name LIKE ? OR p.method LIKE ? OR p.status LIKE ?
    `;

        db.query(sql, [searchQuery, searchQuery, searchQuery, pageSize, offset], (err, results) => {
            if (err) return callback(err);

            db.query(sqlCount, [searchQuery, searchQuery, searchQuery], (countErr, countResult) => {
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
    },

    getCustomers: (callback) => {
        let sql = `select name, id from users`
        db.query(sql, callback)
    },


};

module.exports = OrderModel;
