
const db = require("../config/dbConnection");
const PurchaseModel = require("../modles/purchasemodel");


const PurchaseController = {
  addPurchase: (req, res) => {
    const { vendors, purchaseDate, productsRow } = req.body;
    if (!vendors || !purchaseDate || !productsRow || productsRow.length === 0) {
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
            if (err) return rollbackAndSend({ 500: err.message });
            const purchaseId = orderResult.insertId;
            let completed = 0;
            let hasError = false;

            // 4️⃣ Loop purchase details
            productsRow.forEach((item) => {
              if (item.quantity <= 0 || item.price <= 0) {
                hasError = true;
                return rollbackAndSend({ status: 400, message: "Quantity and Price must be greater than 0" });
              }

              if (err) {
                hasError = true;
                return rollbackAndSend({ status: 500, message: err.message });
              }

              PurchaseModel.checkProductExists(connection, item.product, (err, productResult) => {
                if (hasError) return;
                if (err) { hasError = true; return rollbackAndSend({ status: 500, message: "server error" }); }
                if (productResult.length === 0) { hasError = true; return rollbackAndSend({ status: 400, message: `Product ${item.product} not found` }) }

                //console.log(productResult, "productResult");
                // Insert purchase detail
                PurchaseModel.createPurchaseDetail(connection, {
                  purchase_id: purchaseId,
                  product_id: item.product,
                  quantity: item.quantity,
                  price: item.price,
                  total: item.quantity * item.price,
                }, (err, result) => {
                  if (hasError) return;
                  if (err) { hasError = true; return rollbackAndSend({ status: 500, message: err.message }) }
                  //console.log(result, "create purchase details");

                  // Insert stock log
                  PurchaseModel.insertStockLog(connection, {
                    product_id: item.product,
                    stock_quantity: item.quantity,
                    type: "purchase",
                    activity: "insert",
                    purchase_id: purchaseId,
                  }, (err) => {
                    if (hasError) return;
                    if (err) { hasError = true; return rollbackAndSend({ status: 500, message: err.message }) }

                    // Update product stock
                    PurchaseModel.updateProductStock(connection, item.product, item.quantity, (err) => {
                      if (hasError) return;
                      if (err) { hasError = true; return rollbackAndSend({ status: 500, message: err.message }) }

                      completed++;
                      if (completed === productsRow.length && !hasError) {
                        connection.commit((err) => {
                          if (err) return rollbackAndSend({ status: 500, message: "Commit failed" });
                          if (!connection._released) {
                            connection.release();
                            res.status(200).send({ status: 200, message: "Purchase added successfully" });
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
    const searchValue = req.body.searchValue || '';
    const limit = parseInt(req.body.limit) || 5;
    const page = parseInt(req.body.page) || 1;
    const sortBy = req.body.sortBy;
    const sortOrder = req.body.sortDir;

    PurchaseModel.findAll(searchValue, limit, page, sortBy, sortOrder, (err, data) => {
      if (err) return res.status(500).json({ status: 500, message: err.message });
      res.json(data);
    });
  },

  // updatePurchase: (req, res) => {
  //   const { id } = (req.params);
  //   const purchaseId = parseInt(id);
  //   const { vendors, purchaseDate, purchaseProduct, oldProducts } = req.body;
  //   //console.log(oldProducts)

  //   // if (!vendors || !purchaseDate || !productsRow || productsRow.length === 0) {
  //   //   return res.status(400).send({ status: 400, message: "All fields are required" });
  //   // }
  //   db.getConnection((err, connection) => {
  //     if (err) return res.status(500).send({ status: 500, message: "Database connection failed" });

  //     const rollbackAndSend = (status, message) => {
  //       if (!connection._released) {
  //         connection.rollback(() => {
  //           connection.release();
  //           res.status(status).send({ message });
  //         });
  //       }
  //     };

  //     connection.beginTransaction((err) => {
  //       if (err) {
  //         connection.release();
  //         return res.status(500).send({ status: 500, message: "Transaction start failed" });
  //       }

  //       PurchaseModel.deletePurchaseDetailsData(connection, purchaseId, (err, result) => {
  //         if (err) return rollbackAndSend(500, err.message);

  //         let completed = 0;
  //         let hasError = false;

  //         purchaseProduct.forEach((item) => {
  //           if (hasError) return;

  //           PurchaseModel.checkProductExists(connection, item.product, (err, productResult) => {
  //             if (hasError) return;
  //             if (err) { hasError = true; return rollbackAndSend(500, err.message); }
  //             if (productResult.length === 0) { hasError = true; return rollbackAndSend(400, `Product ${item.product} not found`); }

  //             // Insert purchase detail
  //             PurchaseModel.createPurchaseDetail(connection, {
  //               purchase_id: purchaseId,
  //               product_id: item.product,
  //               quantity: item.quantity,
  //               price: item.price,
  //               total: item.quantity * item.price,
  //             }, (err, result) => {
  //               if (hasError) return;
  //               if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //               // Insert stock log
  //               PurchaseModel.getStockDataById(connection, item.product, (err, result) => {
  //                 // ////console.log(result);
  //                 if (hasError) return;
  //                 if (err) { hasError = true; return rollbackAndSend(500, err.message) }

  //                 let stock = 0;
  //                 result.forEach((element) => {
  //                   if (element.type === "purchase") {
  //                     stock += element.stock_quantity;
  //                   }
  //                 });

  //                 if (stock < 0) {
  //                   stock = 0;
  //                 }


  //                 purchaseQuantity = item.quantity - stock;

  //                 connection.commit((err) => {
  //                   if (err) return rollbackAndSend(500, "Commit failed");
  //                   if (!connection._released) {
  //                     connection.release();
  //                     res.status(200).send({ message: "Purchase added successfully" });
  //                   }
  //                 });

  //                 // PurchaseModel.insertQuantity(connection, item.product, purchaseQuantity, (err, result) => {
  //                 //   if (hasError) return;
  //                 //   if (err) { hasError = true; return rollbackAndSend(500, err.message) }

  //                 //   ////console.log(result);
  //                 //   PurchaseModel.getStockDataById(connection, item.product, (err, result) => {
  //                 //     if (hasError) return;
  //                 //     if (err) { hasError = true; return rollbackAndSend(500, err.message) }

  //                 //     let stock = 0;

  //                 //     result.forEach((element) => {
  //                 //       if (element.type === "purchase") {
  //                 //         stock += element.stock_quantity;
  //                 //       }
  //                 //       if (element.type === "sale") {
  //                 //         stock -= element.stock_quantity;
  //                 //       }
  //                 //     });

  //                 //     if (stock < 0) {
  //                 //       stock = 0;
  //                 //     }

  //                 //     ////console.log(stock, "update product quantity");

  //                 //     PurchaseModel.updateProductQuantity(connection, item.product, stock, (err) => {
  //                 //       if (hasError) return;
  //                 //       if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //                 //       completed++;
  //                 //       if (completed === purchaseProduct.length && !hasError) {
  //                 //         connection.commit((err) => {
  //                 //           if (err) return rollbackAndSend(500, "Commit failed");
  //                 //           if (!connection._released) {
  //                 //             connection.release();
  //                 //             res.status(200).send({ message: "Purchase added successfully" });
  //                 //           }
  //                 //         });
  //                 //       }
  //                 //     });
  //                 //   })

  //                 // })
  //               })
  //               // PurchaseModel.insertStockLog(connection, {
  //               //   product_id: item.product,
  //               //   stock_quantity: item.quantity,
  //               //   type: "purchase"
  //               // }, (err) => {
  //               //   if (hasError) return;
  //               //   if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //               //   // Update product stock
  //               //   PurchaseModel.updateProductStock(connection, item.product, item.quantity, (err) => {
  //               //     if (hasError) return;
  //               //     if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //               //     completed++;
  //               //     if (completed === productsRow.length && !hasError) {
  //               //       connection.commit((err) => {
  //               //         if (err) return rollbackAndSend(500, "Commit failed");
  //               //         if (!connection._released) {
  //               //           connection.release();
  //               //           res.status(200).send({ message: "Purchase added successfully" });
  //               //         }
  //               //       });
  //               //     }
  //               //   });
  //               // });
  //             });
  //           });
  //         });

  //         // connection.commit((err) => {
  //         //   if (err) return rollbackAndSend(500, "Commit failed");
  //         //   if (!connection._released) {
  //         //     connection.release();
  //         //     res.status(200).send({ message: "Purchase added successfully" });
  //         //   }
  //         // });

  //         // let completed = 0;  
  //         // let hasError = false;

  //         // 4️⃣ Loop purchase details
  //         // purchaseProduct.forEach((item) => {
  //         //   if (hasError) return;

  //         //   PurchaseModel.checkProductExists(connection, item.product, (err, productResult) => {
  //         //     if (hasError) return;
  //         //     if (err) { hasError = true; return rollbackAndSend(500, err.message); }
  //         //     if (productResult.length === 0) { hasError = true; return rollbackAndSend(400, `Product ${item.product} not found`); }

  //         //     // Insert purchase detail
  //         //     PurchaseModel.createPurchaseDetail(connection, {
  //         //       purchase_id: purchaseId,
  //         //       product_id: item.product,
  //         //       quantity: item.quantity,
  //         //       price: item.price,
  //         //       total: item.quantity * item.price,
  //         //     }, (err, result) => {
  //         //       if (hasError) return;
  //         //       if (err) { hasError = true; return rollbackAndSend(500, err.message); }
  //         //       ////console.log(result);

  //         //       // Insert stock log
  //         //       // PurchaseModel.getStockDataById(connection, id, (err, result) => {
  //         //       //   ////console.log(result);
  //         //       // })
  //         //       // PurchaseModel.insertStockLog(connection, {
  //         //       //   product_id: item.product,
  //         //       //   stock_quantity: item.quantity,
  //         //       //   type: "purchase"
  //         //       // }, (err) => {
  //         //       //   if (hasError) return;
  //         //       //   if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //         //       //   // Update product stock
  //         //       //   PurchaseModel.updateProductStock(connection, item.product, item.quantity, (err) => {
  //         //       //     if (hasError) return;
  //         //       //     if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //         //       //     completed++;
  //         //       //     if (completed === productsRow.length && !hasError) {
  //         //       //       connection.commit((err) => {
  //         //       //         if (err) return rollbackAndSend(500, "Commit failed");
  //         //       //         if (!connection._released) {
  //         //       //           connection.release();
  //         //       //           res.status(200).send({ message: "Purchase added successfully" });
  //         //       //         }
  //         //       //       });
  //         //       //     }
  //         //       //   });
  //         //       // });
  //         //     });
  //         //   });
  //         // });
  //       })

  //       // 1️⃣ Check vendor exists
  //       // PurchaseModel.checkVendorExists(connection, vendors, (err, result) => {
  //       //   if (err) return rollbackAndSend(500, err.message);
  //       //   if (result.length === 0) return rollbackAndSend({ status: 400, message: "Vendor not found" });

  //       //   // 2️⃣ Calculate total
  //       //   let totalAmount = productsRow.reduce((sum, el) => sum + el.quantity * el.price, 0);

  //       //   // 3️⃣ Insert purchase
  //       //   PurchaseModel.createPurchase(connection, vendors, totalAmount, purchaseDate, (err, orderResult) => {
  //       //     if (err) return rollbackAndSend(500, err.message);

  //       //     const purchaseId = orderResult.insertId;
  //       //     let completed = 0;
  //       //     let hasError = false;

  //       //     // 4️⃣ Loop purchase details
  //       //     productsRow.forEach((item) => {
  //       //       if (hasError) return;

  //       //       PurchaseModel.checkProductExists(connection, item.product, (err, productResult) => {
  //       //         if (hasError) return;
  //       //         if (err) { hasError = true; return rollbackAndSend(500, err.message); }
  //       //         if (productResult.length === 0) { hasError = true; return rollbackAndSend(400, `Product ${item.product} not found`); }

  //       //         // Insert purchase detail
  //       //         PurchaseModel.createPurchaseDetail(connection, {
  //       //           purchase_id: purchaseId,
  //       //           product_id: item.product,
  //       //           quantity: item.quantity,
  //       //           price: item.price,
  //       //           total: item.quantity * item.price,
  //       //         }, (err) => {
  //       //           if (hasError) return;
  //       //           if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //       //           // Insert stock log
  //       //           PurchaseModel.insertStockLog(connection, {
  //       //             product_id: item.product,
  //       //             stock_quantity: item.quantity,
  //       //             type: "purchase"
  //       //           }, (err) => {
  //       //             if (hasError) return;
  //       //             if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //       //             // Update product stock
  //       //             PurchaseModel.updateProductStock(connection, item.product, item.quantity, (err) => {
  //       //               if (hasError) return;
  //       //               if (err) { hasError = true; return rollbackAndSend(500, err.message); }

  //       //               completed++;
  //       //               if (completed === productsRow.length && !hasError) {
  //       //                 connection.commit((err) => {
  //       //                   if (err) return rollbackAndSend(500, "Commit failed");
  //       //                   if (!connection._released) {
  //       //                     connection.release();
  //       //                     res.status(200).send({ message: "Purchase added successfully" });
  //       //                   }
  //       //                 });
  //       //               }
  //       //             });
  //       //           });
  //       //         });
  //       //       });
  //       //     });
  //       //   });
  //       // });
  //     });
  //   });
  // },

  updatePurchase: async (req, res) => {
    const { id } = req.params;
    const purchaseId = parseInt(id);
    const { vendors, purchaseDate, purchaseProduct, oldProducts } = req.body;

    const connection = await new Promise((resolve, reject) => {
      db.getConnection((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    }).catch(err => {
      return res.status(500).send({ message: "Database connection failed", error: err.message });
    });

    if (!connection) return;

    const rollback = async (message, status = 500) => {
      try {
        await new Promise((resolve) => connection.rollback(resolve));
      } finally {
        connection.release();
        res.status(status).send({ message });
      }
    };

    try {
      await new Promise((resolve, reject) => connection.beginTransaction(err => err ? reject(err) : resolve()));

      const oldIds = oldProducts.map(p => p.product_id);
      const newIds = purchaseProduct.map(p => p.product);
      const deletedProducts = oldProducts.filter(p => !newIds.includes(p.product_id));

      for (const item of deletedProducts) {

        await new Promise((resolve, reject) => {
          PurchaseModel.insertStockLog(connection, {
            product_id: item.product_id,
            stock_quantity: -item.quantity,
            type: "purchase",
            activity: "delete",
            purchase_id: purchaseId
          }, (err) => err ? reject(err) : resolve());
        });

        await new Promise((resolve, reject) => {
          PurchaseModel.updateProductQuantityFromStockLog(connection, item.product_id, (err) => err ? reject(err) : resolve());
        });
      }


      await new Promise((resolve, reject) => {
        PurchaseModel.deletePurchaseDetailsData(connection, purchaseId, (err) => err ? reject(err) : resolve());
      });

      let grandTotal = 0;
      for (const item of purchaseProduct) {
        //console.log(item)
        const productResult = await new Promise((resolve, reject) => {
          PurchaseModel.checkProductExists(connection, item.product, (err, result) => err ? reject(err) : resolve(result));
        });

        if (productResult.length === 0) {
          return await rollback(`Product ${item.product} not found`, 400);
        }

        if (item.quantity <= 0 || item.price <= 0) {

          return await rollback({ message: "Quantity and Price must be greater than 0", status: 400 });
        }

        await new Promise((resolve, reject) => {
          PurchaseModel.createPurchaseDetail(connection, {
            purchase_id: purchaseId,
            product_id: item.product,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price,

          }, (err) => err ? reject(err) : resolve());
        });

        grandTotal += item.quantity * item.price

        await new Promise((resolve, reject) => {
          PurchaseModel.updatePurchaseQuantity(connection, grandTotal, purchaseId, (err) => err ? reject(err) : resolve());
        });

        const oldItem = oldProducts.find(p => p.product_id === item.product);
        const quantityDiff = oldItem ? item.quantity - oldItem.quantity : item.quantity;

        if (quantityDiff !== 0) {
          await new Promise((resolve, reject) => {
            PurchaseModel.insertStockLog(connection, {
              product_id: item.product,
              stock_quantity: quantityDiff,
              type: "purchase",
              activity: oldItem ? "update" : "insert",
              purchase_id: purchaseId
            }, (err) => err ? reject(err) : resolve());
          });

          await new Promise((resolve, reject) => {
            PurchaseModel.updateProductQuantityFromStockLog(connection, item.product, (err) => err ? reject(err) : resolve());
          });
        }
      }

      await new Promise((resolve, reject) => connection.commit(err => err ? reject(err) : resolve()));
      connection.release();
      res.status(200).send({ message: "Purchase updated successfully" });

    } catch (err) {
      await rollback(err.message);
    }
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
    ////console.log(id, "getPurchaseDataById");
    PurchaseModel.getPurchaseDataById(id, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "get purchaseDataById", purchaseDataById: result })
    })
  },

  getTotalPurchase: (req, res) => {
    PurchaseModel.getTotalPurchase((err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      const count = result && result[0] ? result[0].totalPurchase : 0;
      res.send({ status: 200, message: "get totalPurchase purchase", totalPurchaseRecord: count })
    })
  },

  getTodayPurchase: (req, res) => {
    PurchaseModel.getTodayPurchase((err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      const count = result && result[0] ? result[0].totalTodayPurchase : 0;
      res.send({ status: 200, message: "get today purchase", todayPurchase: count })
    })
  },




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
