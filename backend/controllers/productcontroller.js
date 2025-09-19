const db = require("../config/dbConnection");
const ProductModel = require("../modles/productmodel");

const ProductController = {
    createProduct: (req, res) => {
        console.log(req.body);
        const { name, category_id, quantity, description, image, price } = req.body;
        const images = req.files["image"] ? req.files["image"][0].filename : null;
        const photoFiles = req.files["photos"];


        if (!category_id) return res.status(400).send({ status: 400, message: "category_id is required" });
        if (!photoFiles || photoFiles.length === 0)
            return res.status(400).send({ status: 400, message: "No photos uploaded" });

        db.getConnection((err, connection) => {
            if (err) return res.status(500).send({ status: 500, message: "Database connection failed" });

            connection.beginTransaction((err) => {
                if (err) {
                    connection.release();
                    return res.status(500).send({ status: 500, message: "Transaction start failed" });
                }

                // 1️⃣ Check category exists
                const checkCategory = `SELECT * FROM category WHERE category_id = ?`;
                connection.query(checkCategory, [category_id], (err, result) => {
                    if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: "server error" }); });
                    if (result.length === 0) return connection.rollback(() => { connection.release(); res.status(400).send({ status: 400, message: "invalid category_id" }); });

                    // 2️⃣ Insert product
                    const productData = { name, category_id, image, quantity, description, price };
                    ProductModel.create(productData, (err, result) => {
                        if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: "DB insert error" }); });

                        const insertId = result.insertId;
                        let completed = 0;
                        const fileNames = photoFiles.map(f => f.filename);

                        fileNames.forEach((fileName) => {
                            const insertImage = `INSERT INTO product_image (image, product_id) VALUES (?,?)`;
                            connection.query(insertImage, [fileName, insertId], (err) => {
                                if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: err.message }); });

                                completed++;
                                if (completed === fileNames.length) {
                                    connection.commit((err) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: "Commit failed" }); });
                                        connection.release();
                                        res.send({ status: 200, message: "Product and images added successfully" });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    },

    // getAllProducts: (req, res) => {
    //     ProductModel.findAll((err, result) => {
    //         if (err) return res.status(500).send({ status: 500, message: err.message });
    //         res.send({ status: 200, message: "Get all products", products: result });
    //     });
    // },

    // getAllProductsBySorting: (req, res) => {
    //     console.log("getAllProductsBySorting");
    //     let { page = 1, limit = 5, sortBy = 'id', sortDir = 'asc' } = req.query;
    //     page = parseInt(page);
    //     limit = parseInt(limit);

    //     ProductModel.getAll(page, limit, sortBy, sortDir, (err, data) => {
    //         if (err) return res.status(500).send({ status: 500, message: err.message });

    //         res.send({
    //             status: 200,
    //             message: 'Products fetched successfully',
    //             total: data.total,
    //             page,
    //             limit,
    //             products: data.products
    //         });
    //     });
    // },

    getAllProducts: (req, res) => {
        const searchValue = req.body.searchValue || '';
        const page = req.body.page || 1;
        const pageSize = req.query.pageSize || 5;
        const sortBy = req.body.sortBy || 'name';
        const sortOrder = req.body.sortDir || asc;
        // console.log(searchValue, page, pageSize, sortBy, sortOrder);
        
        ProductModel.getAllProducts(searchValue, page, pageSize, sortBy, sortOrder, (err, data) => {
            if (err) {
                return res.status(500).json({ message: 'Server error', error: err });
            }
            res.json(data);
        });
    },

    getProductById: (req, res) => {
        const { id } = req.params;
        ProductModel.findById(id, (err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });

            if (result.length === 0) return res.status(404).send({ status: 404, message: "Product not found" });
            ProductModel.getImagesById(id, (err, images) => {
                if (err) return res.status(500).send({ status: 500, message: err.message });
                res.send({ status: 200, message: "Get product", product: result[0], images: images });
            })

        });
    },

    updateProduct: (req, res) => {
        const { id } = req.params;
        const { name, category_id, quantity, price, description } = req.body;

        // ✅ Single image handling
        const singleImage = req.files?.image ? req.files.image[0].filename : null;
        const existingSingleImage = req.body.existingImage || null;

        // ✅ Multiple images
        const multipleImages = req.files?.photos ? req.files.photos.map(f => f.filename) : [];
        let existingImages = [];

        if (req.body.existingImages) {
            existingImages = Array.isArray(req.body.existingImages)
                ? req.body.existingImages
                : [req.body.existingImages];
        }



        db.getConnection((err, connection) => {
            if (err) return res.status(500).send({ status: 500, message: "Database connection failed" });

            connection.beginTransaction(err => {
                if (err) return res.status(500).send({ status: 500, message: "Transaction start failed" });

                // ✅ Check product exists
                const checkProduct = `SELECT * FROM product WHERE id = ?`;
                connection.query(checkProduct, [id], (err, result) => {
                    if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: "Server error" }); });
                    if (result.length === 0) return connection.rollback(() => { connection.release(); res.status(404).send({ status: 404, message: "Product not found" }); });

                    // ✅ Check category exists
                    const checkCategory = `SELECT * FROM category WHERE category_id = ?`;
                    connection.query(checkCategory, [category_id], (err, result) => {
                        if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: "Server error" }); });
                        if (result.length === 0) return connection.rollback(() => { connection.release(); res.status(400).send({ status: 400, message: "Category not exists" }); });

                        // ✅ Prepare product data
                        const productData = {
                            name,
                            category_id,
                            quantity,
                            price,
                            description,
                            image: singleImage || existingSingleImage // keep old if no new upload
                        };

                        // ✅ Update product
                        ProductModel.update(id, productData, (err) => {
                            if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: err.message }); });

                            // ✅ Reset product images (delete then re-insert)
                            const deleteOldImagesQuery = `DELETE FROM product_image WHERE product_id = ?`;
                            connection.query(deleteOldImagesQuery, [id], (err) => {
                                if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: err.message }); });

                                // ✅ Merge old + new images
                                const allImages = [...existingImages, ...multipleImages];
                                if (allImages.length > 0) {
                                    const insertImagesQuery = `INSERT INTO product_image (product_id, image) VALUES ?`;
                                    const values = allImages.map(img => [id, img]);

                                    connection.query(insertImagesQuery, [values], (err) => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: err.message }); });

                                        connection.commit(err => {
                                            if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: "Commit failed" }); });
                                            connection.release();
                                            res.send({ status: 200, message: "Product updated successfully" });
                                        });
                                    });
                                } else {
                                    // ✅ No multiple images left
                                    connection.commit(err => {
                                        if (err) return connection.rollback(() => { connection.release(); res.status(500).send({ status: 500, message: "Commit failed" }); });
                                        connection.release();
                                        res.send({ status: 200, message: "Product updated successfully (no images)" });
                                    });
                                }
                            });
                        });
                    });
                });
            });
        });
    },

    deleteProduct: (req, res) => {
        const { id } = req.params;
        console.log("delete product", id);
        if (!id) return res.status(400).send({ status: 400, message: "id is required" });
        ProductModel.checkProductExistsOnProductImage(id, (err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            if (result.length > 0) res.status(400).send({ status: 400, message: "product exits on product_image table you cannot delete it" });
            else {
                ProductModel.checkProductExistsOnPurchaseDetails(id, (err, result) => {
                    if (err) {
                        return res.status(500).send({ status: 500, message: err.message });
                    }
                    else if (result.length > 0) {
                        return res.status(400).send({ status: 400, message: "product exits on purchase_details table you cannot delete it" });
                    }
                    else {
                        ProductModel.checkProductExistsOnStockLogTable(id, (err, result) => {
                            if (err) {
                                return res.status(500).send({ status: 500, message: err.message });
                            }
                            else if (result.length > 0) {
                                return res.status(400).send({ status: 400, message: "product exits on stock_log_table you cannot delete it" });
                            }
                            else {
                                ProductModel.checkProductExistsOnOrderDetails(id, (err, result) => {
                                    if (err) {
                                        return res.status(500).send({ status: 500, message: err.message });
                                    }
                                    else if (result.length > 0) {
                                        return res.status(400).send({ status: 400, message: "product exits on order_details table you cannot delete it" });
                                    }
                                    else {
                                        ProductModel.delete(id, (err, result) => {
                                            if (err) return res.status(500).send({ status: 500, message: err.message });
                                            res.send({ status: 200, message: "Product deleted successfully" });
                                        });
                                    }
                                })
                            }
                        })
                    }
                })
            }
        })
    },

    searchProduct: (req, res) => {
        const { searchValue } = req.body;
        ProductModel.searchByName(searchValue, (err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            res.send({ status: 200, message: "Search results", searchProductResponse: result });
        });
    },

    exactSearchProduct: (req, res) => {
        const { searchTerm } = req.body;
        ProductModel.exactSearch(searchTerm, (err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            res.send({ status: 200, message: "Exact search results", products: result });
        });
    },

    getLowestQuantityProducts: (req, res) => {
        console.log("getLowestQuantityProducts");
        ProductModel.getLowestQuantity((err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            res.send({ status: 200, message: "Lowest quantity products", products: result });
        });
    },

    getAllProductsCount: (req, res) => {
        console.log("getAllProductsCount");
        ProductModel.getAllProductsCount((err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            const count = result && result[0] ? result[0]. productCount : 0;
            res.send({ status: 200, message: "getAllProductsCount", TotalProducts: count })
        })
    },

    getAllCategory: (req, res) => {
        ProductModel.getAllCategory((err, result) => {
            if (err) return res.status(500).send({ status: 500, message: err.message });
            res.send({ status: 200, message: "Get all categories", categories: result })
        })
    }
};

module.exports = ProductController;



// product crud start
// app.post(
//   "/product",
//   upload.fields([
//     { name: "image", maxCount: 1 },
//     { name: "photos", maxCount: 2 },
//   ]),
//   (req, res) => {
//     const { product_name, category_id, quantity, description, price } =
//       req.body;
//     const image = req.files["image"] ? req.files["image"][0].filename : null;

//     if (!category_id) {
//       return res
//         .status(400)
//         .send({ status: 400, message: "category_id is required" });
//     }

//     db.getConnection((err, connection) => {
//       if (err) {
//         return res
//           .status(500)
//           .send({ status: 500, message: "Database connection failed" });
//       }

//       connection.beginTransaction((err) => {
//         if (err) {
//           connection.release();
//           return res
//             .status(500)
//             .send({ status: 500, message: "Transaction start failed" });
//         }

//         // 1️⃣ Check category exists
//         const checkCategory = `SELECT * FROM category WHERE category_id = ?`;
//         connection.query(checkCategory, [category_id], (err, result) => {
//           if (err) {
//             return connection.rollback(() => {
//               connection.release();
//               res.status(500).send({ status: 500, message: "server error" });
//             });
//           } else if (result.length === 0) {
//             return connection.rollback(() => {
//               connection.release();
//               res
//                 .status(400)
//                 .send({ status: 400, message: "invalid category_id" });
//             });
//           }

//           // 2️⃣ Insert product
//           const insertProduct =
//             "INSERT INTO product (name, category_id, image, quantity, description, price) VALUES (?,?,?,?,?,?)";
//           connection.query(
//             insertProduct,
//             [
//               product_name,
//               category_id,
//               image,
//               quantity,
//               description,
//               price,
//             ],
//             (err, result) => {
//               if (err) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   res
//                     .status(500)
//                     .send({ status: 500, message: "DB insert error" });
//                 });
//               }

//               const insertId = result.insertId;
//               if (!insertId) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   res.status(500).send({
//                     status: 500,
//                     message: "Failed to retrieve insertId",
//                   });
//                 });
//               }

//               // 3️⃣ Insert product images
//               const photoFiles = req.files["photos"];
//               if (!photoFiles || photoFiles.length === 0) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   res
//                     .status(400)
//                     .send({ status: 400, message: "No photos uploaded" });
//                 });
//               }

//               const fileNames = photoFiles.map((file) => file.filename);

//               let completed = 0;
//               fileNames.forEach((fileName) => {
//                 const insertImage = `INSERT INTO product_image (image, product_id) VALUES (?,?)`;
//                 connection.query(insertImage, [fileName, insertId], (err) => {
//                   if (err) {
//                     return connection.rollback(() => {
//                       connection.release();
//                       res
//                         .status(500)
//                         .send({ status: 500, message: err.message });
//                     });
//                   }

//                   completed++;
//                   if (completed === fileNames.length) {
//                     // ✅ Commit only after all images inserted
//                     connection.commit((err) => {
//                       if (err) {
//                         return connection.rollback(() => {
//                           connection.release();
//                           res
//                             .status(500)
//                             .send({ status: 500, message: "Commit failed" });
//                         });
//                       }

//                       connection.release();
//                       res.send({
//                         status: 200,
//                         message: "Product and images added successfully",
//                       });
//                     });
//                   }
//                 });
//               });
//             }
//           );
//         });
//       });
//     });
//   }
// );

// app.get("/product", (req, res) => {
//   const sql = `select * from product`;
//   db.query(sql, (err, result) => {
//     if (err) {
//     } else {
//       res.send({ status: 200, message: "get all products", products: result });
//     }
//   });
// });

// app.patch("/update-product/:id", upload.single("image"), (req, res) => {
//   const { id } = req.params;
//   const { product_name, category_id, quantity, description } = req.body;
//   const image = req.file ? req.file.filename : null;

//   if (!id) {
//     return res.status(400).send({ status: 400, message: "id is required" });
//   }

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

//       // 1️⃣ Check if product exists
//       const checkProductId = `SELECT * FROM product WHERE id = ?`;
//       connection.query(checkProductId, [id], (error, result) => {
//         if (error) {
//           return connection.rollback(() => {
//             connection.release();
//             res.status(500).send({ status: 500, message: "server error" });
//           });
//         } else if (result.length === 0) {
//           return connection.rollback(() => {
//             connection.release();
//             res.status(400).send({
//               status: 400,
//               message: "product not exists in database",
//             });
//           });
//         }

//         // 2️⃣ Check if category exists
//         const checkCategory = `SELECT * FROM category WHERE category_id = ?`;
//         connection.query(checkCategory, [category_id], (err, result) => {
//           if (err) {
//             return connection.rollback(() => {
//               connection.release();
//               res.status(500).send({ status: 500, message: "server error" });
//             });
//           } else if (result.length === 0) {
//             return connection.rollback(() => {
//               connection.release();
//               res.status(400).send({
//                 status: 400,
//                 message: "category not exists in database",
//               });
//             });
//           }

//           // 3️⃣ Update product
//           const updateSql =
//             "UPDATE product SET name = ?, category_id = ?, image = ?, quantity = ?, description = ? WHERE id = ?";
//           connection.query(
//             updateSql,
//             [product_name, category_id, image, quantity, description, id],
//             (err, result) => {
//               if (err) {
//                 return connection.rollback(() => {
//                   connection.release();
//                   res.status(500).send({ status: 500, message: err.message });
//                 });
//               }

//               // ✅ Commit if everything is fine
//               connection.commit((err) => {
//                 if (err) {
//                   return connection.rollback(() => {
//                     connection.release();
//                     res
//                       .status(500)
//                       .send({ status: 500, message: "Commit failed" });
//                   });
//                 }

//                 connection.release();
//                 res.send({
//                   status: 200,
//                   message: "product updated successfully",
//                 });
//               });
//             }
//           );
//         });
//       });
//     });
//   });
// });

// //❌
// app.delete("/delete-product/:id", (req, res) => {
//   const { id } = req.params;
//   if (id === "undefined" || id === "null" || id === '""') {
//     ////console.log("id is required");
//     return res.send({ status: 400, message: "id is required" });
//   }
//   const sql = "DELETE FROM product WHERE id = ?";
//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       res.send({ status: 500, message: err.message });
//     } else {
//       res.send({ status: 200, message: "product deleted successfully" });
//     }
//   });
// });

// app.get("/showProduct/:id", (req, res) => {
//   const id = req.params.id;
//   //console.log(id);

//   if (id === "undefined" || id === "null" || id === '""') {
//     return res.send({ status: 400, message: "id is required" });
//   }
//   let sql = `select * from product where id = ?`;
//   db.query(sql, [id], (err, result) => {
//     if (err) {
//       res.send({ status: 500, message: err.message });
//     } else if (result.length === 0) {
//       return res.send({ status: 400, message: "product not found" });
//     } else {
//       const sql = `select * from product where id = ?`;
//       db.query(sql, [id], (err, result) => {
//         if (err) {
//           err.send({ status: 500, message: err.message });
//         } else {
//           res.send({ status: 200, message: "get product", category: result });
//         }
//       });
//     }
//   });
// });

// app.get("/search-product", (req, res) => {
//   let searchTerm = req.body.searchTerm;
//   let sql = `SELECT * FROM product WHERE name LIKE '%${searchTerm}%'`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: "server error" });
//     } else {
//       return res.send({
//         status: 200,
//         message: "search results",
//         products: result,
//       });
//     }
//   });
// });

// app.get("/exact-search", (req, res) => {
//   let searchTerm = req.body.searchTerm;
//   let sql = `SELECT * FROM product WHERE name = ?`;
//   db.query(sql, [searchTerm], (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: "server error" });
//     } else {
//       return res.send({
//         status: 200,
//         message: "search results",
//         products: result,
//       });
//     }
//   });
// });

// app.post("/product-images", upload.array("photos", 2), (req, res) => {
//   const id = req.body.id;
//   if (!req.files) {
//     return res.send({ status: 400, message: "No files uploaded" });
//   } else {
//     let checkProductId = `select * from product where id = ?`;
//     db.query(checkProductId, [id], (error, result) => {
//       if (error) {
//         return res.send({ status: 500, message: "server error" });
//       } else if (result.length === 0) {
//         return res.send({
//           status: 400,
//           message: "product not exits in database",
//         });
//       } else {
//         let fileNames = req.files.map((file) => file.filename);
//         fileNames.forEach((element, i) => {
//           let sql = `insert into product_image (image, product_id) values (?,?)`;
//           db.query(sql, [element, id], (err, result) => {
//             if (err) {
//               return res.send({ status: 500, message: err.message });
//             }
//             if (fileNames.length - 1 === i) {
//               return res.send({
//                 status: 200,
//                 message: "images added successfully",
//               });
//             }
//           });
//         });
//       }
//     });
//   }
// });

// app.get("/showLowestQuantityProduct", (req, res) => {
//   let sql = `select * from product where quantity < 5`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: "server error" });
//     } else {
//       return res.send({
//         status: 200,
//         message: "get products",
//         products: result,
//       });
//     }
//   });
// });

// app.get("/getAllImageProducts", (req, res) => {
//   let sql = `select * from product_image`;
//   db.query(sql, (err, result) => {
//     if (err) {
//       res.send({ status: 500, message: err.message });
//     } else {
//       res.send({ status: 200, message: "get images", images: result });
//     }
//   });
// });

// app.delete("/delete-image/:id", (req, res) => {
//   ////console.log("delete-image");
//   const id = req.params.id;
//   if (id === "undefined" || id === "null" || id === '""') {
//     return res.send({ status: 400, message: "id is required" });
//   } else {
//     let sql = `select * from product_image where id = ?`;
//     db.query(sql, [id], (err, result) => {
//       if (err) {
//         res.send({ status: 500, message: err.message });
//       } else if (result.length === 0) {
//         res.send({ status: 400, message: "image not found" });
//       } else {
//         let sql = `delete from product_image where id = ?`;
//         db.query(sql, [id], (err, result) => {
//           if (err) {
//             res.send({ status: 500, message: err.message });
//           } else {
//             res.send({ status: 200, message: "image deleted successfully" });
//           }
//         });
//       }
//     });
//   }
// });

// app.get("/getAllImageRelatedProduct/:id", (req, res) => {
//   ////console.log("getAllImageRelatedProduct");
//   const id = req.params.id;
//   if (id === "undefined" || id === "null" || id === '""') {
//     ////console.log("id is required");
//     return res.send({ status: 400, message: "id is required" });
//   } else {
//     let sql = "select * from product_image where product_id = ?";
//     db.query(sql, [id], (err, result) => {
//       if (err) {
//         return res.send({ status: 500, message: "server error" });
//       } else if (result.length === 0) {
//         return res.send({ status: 400, message: "image not found" });
//       } else {
//         return res.send({ status: 200, message: "get images", images: result });
//       }
//     });
//   }
// });
// product crud end

