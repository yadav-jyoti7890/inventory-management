const { it } = require("node:test");
const db = require("../config/dbConnection");
const PurchaseModel = require("../modles/purchasemodel");

const PurchaseController = {
  addPurchase: (req, res) => {
    const { vendors, purchaseDate, productsRow } = req.body;
    console.log( vendors, purchaseDate, productsRow);
    
    
    if (!vendors ||  !purchaseDate || !productsRow || productsRow.length === 0) {
      return res.status(400).send({ status: 400, message: "All fields are required" });
    }
    db.getConnection((err, connection) => {
      if (err) return res.status(500).send({ status: 500, message: "Database connection failed" });

      const rollbackAndSend = (status, message) => {
        if (!connection._released) {
          connection.rollback(() => {
            connection.release();
            res.status(status).send({ message });
          });
        }
      };


      connection.beginTransaction((err) => {
        if (err) {
          connection.release();
          return res.status(500).send({ status: 500, message: "Transaction start failed" });
        }

        // 1️⃣ Check vendor exists
        PurchaseModel.checkVendorExists(connection, vendors, (err, result) => {
          if (err) return rollbackAndSend(500, err.message);
          if (result.length === 0) return rollbackAndSend({ status: 400, message: "Vendor not found" });

          // 2️⃣ Calculate total
          let totalAmount = productsRow.reduce((sum, el) => sum + el.quantity * el.price, 0);

          // 3️⃣ Insert purchase
          PurchaseModel.createPurchase(connection, vendors, totalAmount, purchaseDate, (err, orderResult) => {
            if (err) return rollbackAndSend(500, err.message);

            const purchaseId = orderResult.insertId;
            let completed = 0;
            let hasError = false;

            // 4️⃣ Loop purchase details
            productsRow.forEach((item) => {
              if (hasError) return;

              PurchaseModel.checkProductExists(connection, item.product, (err, productResult) => {
                if (hasError) return;
                if (err) { hasError = true; return rollbackAndSend(500, err.message); }
                if (productResult.length === 0) { hasError = true; return rollbackAndSend(400, `Product ${item.product} not found`); }

                // Insert purchase detail
                PurchaseModel.createPurchaseDetail(connection, {
                  purchase_id: purchaseId,
                  product_id: item.product,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.quantity * item.price,
                }, (err) => {
                  if (hasError) return;
                  if (err) { hasError = true; return rollbackAndSend(500, err.message); }

                  // Insert stock log
                  PurchaseModel.insertStockLog(connection, {
                    product_id: item.product,
                    stock_quantity: item.quantity,
                    type: "purchase"
                  }, (err) => {
                    if (hasError) return;
                    if (err) { hasError = true; return rollbackAndSend(500, err.message); }

                    // Update product stock
                    PurchaseModel.updateProductStock(connection, item.product, item.quantity, (err) => {
                      if (hasError) return;
                      if (err) { hasError = true; return rollbackAndSend(500, err.message); }

                      completed++;
                      if (completed === productsRow.length && !hasError) {
                        connection.commit((err) => {
                          if (err) return rollbackAndSend(500, "Commit failed");
                          if (!connection._released) {
                            connection.release();
                            res.status(200).send({ message: "Purchase added successfully" });
                          }
                        });
                      }
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  },

  getPurchaseData: (req, res) => {
    PurchaseModel.findAll((err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Get all purchases", purchase: result });
    });
  },

  updatePurchase: (req, res) => {
    console.log(req.body);
    
    // const { id } = req.params;
    // const { vendors_id } = req.body;

    // PurchaseModel.update(id, vendors_id, (err, result) => {
    //   if (err) return res.status(500).send({ status: 500, message: err.message });
    //   res.send({ status: 200, message: "Purchase updated successfully" });
    // });
  },

  deletePurchase: (req, res) => {
    const { id } = req.params;

    PurchaseModel.delete(id, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Purchase deleted successfully" });
    });
  },

  getVendors: (req, res) => {
    PurchaseModel.getVendors((err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "get vendors", vendors: result })
    })
  },

  getProducts: (req, res) => {
    PurchaseModel.getProducts((err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "get All Products", products: result })
    })
  },

  getPurchaseDataById: (req, res) => {
    const { id } = req.params;
    console.log(id, "getPurchaseDataById");
    PurchaseModel.getPurchaseDataById(id, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "get purchaseDataById", purchaseDataById: result })
    })
  }

};

module.exports = PurchaseController;

//purchase crud start
// app.post("/addPurchase", (req, res) => {
//   const { vendors_id, productsRow } = req.body;

//   db.getConnection((err, connection) => {
//     if (err) {
//       return res
//         .status(500)
//         .send({ status: 500, message: "Database connection failed" });
//     }

//     connection.beginTransaction((err) => {
//       if (err) {
//         connection.release();
//         return res
//           .status(500)
//           .send({ status: 500, message: "Transaction start failed" });
//       }

//       // 1️⃣ Check vendor exists
//       const checkVendor = `SELECT * FROM vendors WHERE id = ?`;
//       connection.query(checkVendor, [vendors_id], (err, result) => {
//         if (err) {
//           return connection.rollback(() => {
//             connection.release();
//             res.status(500).send({ status: 500, message: err.message });
//           });
//         } else if (result.length === 0) {
//           return connection.rollback(() => {
//             connection.release();
//             res.status(400).send({ status: 400, message: "vendor not found" });
//           });
//         }

//         // 2️⃣ Calculate total
//         let sum = 0;
//         productsRow.forEach((el) => {
//           sum += el.quantity * el.price;
//         });

//         // 3️⃣ Insert into purchase
//         const insertPurchase = `INSERT INTO purchase(vendors_id, total_amount) VALUES (?,?)`;
//         connection.query(
//           insertPurchase,
//           [vendors_id, sum],
//           (err, orderResult) => {
//             if (err) {
//               return connection.rollback(() => {
//                 connection.release();
//                 res.status(500).send({ status: 500, message: err.message });
//               });
//             }

//             const orderId = orderResult.insertId;
//             let completed = 0;
//             let hasError = false;

//             // 4️⃣ Loop purchase details
//             productsRow.forEach((element) => {
//               // Check product exists
//               connection.query(
//                 `SELECT * FROM product WHERE id = ?`,
//                 [element.product_id],
//                 (err, result) => {
//                   if (hasError) return;
//                   if (err) {
//                     hasError = true;
//                     return connection.rollback(() => {
//                       connection.release();
//                       res.status(500).send({ message: err.message });
//                     });
//                   }
//                   if (result.length === 0) {
//                     hasError = true;
//                     return connection.rollback(() => {
//                       connection.release();
//                       res.status(400).send({
//                         message: `Product ${element.product_id} not found`,
//                       });
//                     });
//                   }

//                   // Insert into productsRow
//                   const insertDetail = `INSERT INTO productsRow(purchase_id, product_id, quantity, price, total) VALUES (?,?,?,?,?)`;
//                   connection.query(
//                     insertDetail,
//                     [
//                       orderId,
//                       element.product_id,
//                       element.quantity,
//                       element.price,
//                       element.quantity * element.price,
//                     ],
//                     (err) => {
//                       if (hasError) return;
//                       if (err) {
//                         hasError = true;
//                         return connection.rollback(() => {
//                           connection.release();
//                           res.status(500).send({ message: err.message });
//                         });
//                       }

//                       // Insert into stock log
//                       const insertStockLog = `INSERT INTO stock_log_table (product_id, stock_quantity, type) VALUES (?,?,?)`;
//                       connection.query(
//                         insertStockLog,
//                         [element.product_id, element.quantity, "purchase"],
//                         (err) => {
//                           if (hasError) return;
//                           if (err) {
//                             hasError = true;
//                             return connection.rollback(() => {
//                               connection.release();
//                               res.status(500).send({ message: err.message });
//                             });
//                           }

//                           // Update product stock
//                           const updateStock = `UPDATE product SET quantity = quantity + ? WHERE id = ?`;
//                           connection.query(
//                             updateStock,
//                             [element.quantity, element.product_id],
//                             (err) => {
//                               if (hasError) return;
//                               if (err) {
//                                 hasError = true;
//                                 return connection.rollback(() => {
//                                   connection.release();
//                                   res
//                                     .status(500)
//                                     .send({ message: err.message });
//                                 });
//                               }

//                               completed++;
//                               if (completed === productsRow.length) {
//                                 // ✅ Commit transaction only after all products processed
//                                 connection.commit((err) => {
//                                   if (err) {
//                                     return connection.rollback(() => {
//                                       connection.release();
//                                       res
//                                         .status(500)
//                                         .send({ message: "Commit failed" });
//                                     });
//                                   }

//                                   connection.release();
//                                   res.status(200).send({
//                                     message: "purchase added successfully",
//                                   });
//                                 });
//                               }
//                             }
//                           );
//                         }
//                       );
//                     }
//                   );
//                 }
//               );
//             });
//           }
//         );
//       });
//     });
//   });
// });

// app.get("/purchase", (req, res) => {
//   let sql = `select * from purchase`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: err.message });
//     } else {
//       return res.send({
//         status: 200,
//         message: "get purchase",
//         purchase: result,
//       });
//     }
//   });
// });

// app.patch("/updatePurchase/:id", (req, res) => {
//   const id = req.params.id;
//   const { vendors_id } = req.body;
//   let sql = `update purchase set vendors_id = ? where id = ?`;
//   db.query(sql, [vendors_id, id], (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: err.message });
//     } else {
//       return res.send({
//         status: 200,
//         message: "purchase updated successfully",
//       });
//     }
//   });
// });

// app.delete("/deletePurchase/:id", (req, res) => {
//   const id = req.params.id;
//   let sql = `delete from purchase where id = ?`;
//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: err.message });
//     } else {
//       return res.send({
//         status: 200,
//         message: "purchase deleted successfully",
//       });
//     }
//   });
// });
