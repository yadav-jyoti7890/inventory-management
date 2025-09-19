const db = require("../config/dbConnection");
const OrderModel = require("../modles/ordermodel");

const OrderController = {

    addOrder: async (req, res) => {
        console.log("addOrder");

        const { user_id, total_item, orders } = req.body;
        if (!user_id || !total_item || !orders || orders.length === 0) {
            return res.status(400).send({ message: "All fields are required" });
        }

        console.log(user_id, total_item, orders);

        db.getConnection(async (err, connection) => {
            if (err) return res.status(500).send({ message: err.message });

            connection.beginTransaction(async (err) => {
                if (err) {
                    connection.release();
                    return res.status(500).send({ message: err.message });
                }

                try {
                    // 1️⃣ Check user exists
                    const userResult = await OrderModel.checkUserExistsAsync(user_id, connection);
                    if (userResult.length === 0) throw new Error("User not found");

                    // 2️⃣ Calculate total
                    const totalAmount = orders.reduce((acc, item) => acc + item.quantity * item.price, 0);

                    // 3️⃣ Insert order
                    const orderResult = await OrderModel.createOrderAsync(user_id, total_item, totalAmount, connection);
                    const orderId = orderResult.insertId;

                    // 4️⃣ Loop orders sequentially
                    for (const element of orders) {
                        const productResult = await OrderModel.checkProductExistsAsync(element.product_id, connection);

                        if (productResult.length === 0) throw new Error(`Product ${element.product_id} not found`);
                        if (element.quantity > productResult[0].quantity) throw new Error("Quantity not available");
                        if (element.price < productResult[0].price) throw new Error("Amount is not enough");

                        await OrderModel.createOrderDetailAsync({
                            order_id: orderId,
                            product_id: element.product_id,
                            price: element.price,
                            quantity: element.quantity,
                            total: element.quantity * element.price
                        }, connection);

                        await OrderModel.insertStockLogAsync({
                            product_id: element.product_id,
                            stock_quantity: element.quantity,
                            type: "sale"
                        }, connection);

                        await OrderModel.updateProductStockAsync(element.product_id, element.quantity, connection);
                    }

                    // 5️⃣ Commit transaction
                    connection.commit((err) => {
                        if (err) throw err;
                        connection.release();
                        res.status(200).send({ message: "Order added successfully with transaction" });
                    });

                } catch (err) {
                    connection.rollback(() => {
                        connection.release();
                        res.status(400).send({ message: err.message });
                    });
                }
            });
        });
    },

    getAllOrders: (req, res) => {
        OrderModel.findAll((err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            res.send({ status: 200, message: "Get orders", orders: result });
        });
    },

    deleteOrder: (req, res) => {
        const { id } = req.params;
        OrderModel.delete(id, (err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            res.send({ status: 200, message: "Order deleted successfully" });
        });
    },

    getTotalTodayOrders: (req, res) => {
        OrderModel.getTotalTodayOrders((err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            console.log(result);
            
            const count = result && result[0] ? result[0].totalTodayOrders : 0;
            res.send({ status: 200, message: "Get total today orders", totalTodayOrders: count })
        })
    },

    totalOrders: (req, res) => {
        OrderModel.getTotalOrders((err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            const count = result && result[0] ? result[0].totalOrders : 0;
            res.send({ status: 200, message: "Get totalOrdersCount", totalOrders: count })
        })
    }
};

module.exports = OrderController;


// app.post("/orders", (req, res) => {
//   const { user_id, total_item, orders } = req.body;

//   db.getConnection((err, connection) => {
//     if (err) return res.status(500).send({ message: err.message });

//     // 1. Start transaction
//     connection.beginTransaction((err) => {
//       if (err) {
//         connection.release();
//         return res.status(500).send({ message: err.message });
//       }

//       // 2. Check user exists
//       connection.query(
//         "SELECT * FROM users WHERE id = ?",
//         [user_id],
//         (err, userResult) => {
//           if (err) {
//             return connection.rollback(() => {
//               connection.release();
//               res.status(500).send({ message: err.message });
//             });
//           }
//           if (userResult.length === 0) {
//             return connection.rollback(() => {
//               connection.release();
//               res.status(400).send({ message: "User not found" });
//             });
//           }

//           // 3. Calculate total
//           let sum = orders.reduce(
//             (acc, item) => acc + item.quantity * item.price,
//             0
//           );

//           connection.query(
//             "INSERT INTO orders(user_id, total_item, total_amount) VALUES (?,?,?)",
//             [user_id, total_item, sum],
//             (err, orderResult) => {
//               if (err) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   res.status(500).send({ message: err.message });
//                 });
//               }

//               const orderId = orderResult.insertId;

//               let completed = 0;
//               let hasError = false;

//               orders.forEach((element) => {
//                 if (hasError) return;

//                 // 5. Check product
//                 connection.query(
//                   "SELECT * FROM product WHERE id = ?",
//                   [element.product_id],
//                   (err, productResult) => {
//                     if (err || productResult.length === 0) {
//                       hasError = true;
//                       return connection.rollback(() => {
//                         connection.release();
//                         res.status(400).send({
//                           message: err
//                             ? err.message
//                             : `Product ${element.product_id} not found`,
//                         });
//                       });
//                     }

//                     if (element.quantity > productResult[0].quantity) {
//                       hasError = true;
//                       return connection.rollback(() => {
//                         connection.release();
//                         res
//                           .status(400)
//                           .send({ message: "Quantity not available" });
//                       });
//                     }
//                     // //console.log(typeof element.price, typeof productResult[0].price, element.price >= productResult[0].price);
//                     // //console.log(productResult);

//                     if (element.price < productResult[0].price) {
//                       hasError = true;
//                       return connection.rollback(() => {
//                         connection.release();
//                         res
//                           .status(400)
//                           .send({ message: "amount is not enough" });
//                       });
//                     }

//                     // 6. Insert order_details
//                     connection.query(
//                       "INSERT INTO order_details(order_id, product_id, price, quantity, total) VALUES (?,?,?,?,?)",
//                       [
//                         orderId,
//                         element.product_id,
//                         element.price,
//                         element.quantity,
//                         element.quantity * element.price,
//                       ],
//                       (err) => {
//                         if (err) {
//                           hasError = true;
//                           return connection.rollback(() => {
//                             connection.release();
//                             res.status(500).send({ message: err.message });
//                           });
//                         }

//                         // 7. Insert stock log
//                         connection.query(
//                           "INSERT INTO stock_log_table(product_id, stock_quantity, type) VALUES (?,?,?)",
//                           [element.product_id, element.quantity, "sale"],
//                           (err) => {
//                             if (err) {
//                               hasError = true;
//                               return connection.rollback(() => {
//                                 connection.release();
//                                 res.status(500).send({ message: err.message });
//                               });
//                             }

//                             // 8. Update product stock
//                             connection.query(
//                               "UPDATE product SET quantity = quantity - ? WHERE id = ?",
//                               [element.quantity, element.product_id],
//                               (err) => {
//                                 if (err) {
//                                   hasError = true;
//                                   return connection.rollback(() => {
//                                     connection.release();
//                                     res
//                                       .status(500)
//                                       .send({ message: err.message });
//                                   });
//                                 }

//                                 completed++;
//                                 if (completed === orders.length && !hasError) {
//                                   // 9. Commit transaction
//                                   connection.commit((err) => {
//                                     if (err) {
//                                       return connection.rollback(() => {
//                                         connection.release();
//                                         res
//                                           .status(500)
//                                           .send({ message: err.message });
//                                       });
//                                     }
//                                     connection.release();
//                                     res.status(200).send({
//                                       message:
//                                         "Order added successfully with transaction",
//                                     });
//                                   });
//                                 }
//                               }
//                             );
//                           }
//                         );
//                       }
//                     );
//                   }
//                 );
//               });
//             }
//           );
//         }
//       );
//     });
//   });
// });

// app.get("/orders", (req, res) => {
//   let sql = `select * from orders`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: err.message });
//     } else {
//       return res.send({ status: 200, message: "get orders", orders: result });
//     }
//   });
// });

// app.delete("/orders/:id", (req, res) => {
//   const id = req.params.id;
//   let sql = `delete from orders where id = ?`;
//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: err.message });
//     } else {
//       return res.send({ status: 200, message: "order deleted successfully" });
//     }
//   });
// });
