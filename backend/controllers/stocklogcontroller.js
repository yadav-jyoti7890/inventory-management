const db = require("../config/dbConnection");
const StockModel = require("../modles/stocklogmodel");

const StockController = {
  getAvailableQty: (req, res) => {
    StockModel.getAvailableQty((err, result) => {
      if (err)
        return res.status(500).send({ status: 500, message: err.message });

      const groupedData = [];

      result.forEach((item) => {
        const productId = item.product_id;

        if (!groupedData[productId]) groupedData[productId] = [];
        groupedData[productId].push(item);
      });

      const finalResult = Object.values(groupedData);

      const r = finalResult.map((item) => {
        const filtered = item.filter((el) => el.product_id);

        // Transform stock data
        const stocks = filtered.map((element) => ({
          stock_id: element.stock_id,
          purchase_date: element.purchase_date,
          created_at: element.stock_created_at,
          updated_at: element.stock_updated_at,
          type: element.stock_type,
          stock_quantity: element.stock_quantity,
        }));

        // Calculate available qty
        let available_qty = filtered.reduce((sum, el) => {
          if (el.stock_type === "purchase") return sum + el.stock_quantity;
          if (el.stock_type === "sale") return sum - el.stock_quantity;
          return sum;
        }, 0);

        let balance_qty = filtered[0] ? filtered[0].product_quantity : 0;

        // Product object
        const product = {
          id: filtered[0].product_id,
          name: filtered[0].product_name,
          category_id: filtered[0].category_id,
          image: filtered[0].image,
          quantity: filtered[0].product_quantity,
          description: filtered[0].description,
          price: filtered[0].price,
          created_at: filtered[0].product_created_at,
          updated_at: filtered[0].product_updated_at,
        };

        return {
          stocks,
          product,
          available_qty,
          balance_qty,
        };
      });

      return res.status(200).send({ status: 200, message: r });
    });
  },
};

module.exports = StockController;

// app.get("/getAvailableQty", (req, res) => {
//   let sql = `SELECT
//     P.id AS product_id,
//     P.name AS product_name,
//     P.category_id,
//     P.image,
//     P.quantity AS product_quantity,
//     P.description,
//     P.price,
//     P.created_at AS product_created_at,
//     P.updated_at AS product_updated_at,

//     s.id AS stock_id,
//     s.purchase_date,
//     s.type AS stock_type,
//     s.stock_quantity,
//     s.created_at AS stock_created_at,
//     s.updated_at AS stock_updated_at

//   FROM product AS P
//   INNER JOIN stock_log_table AS s
//   ON P.id = s.product_id
//   ORDER BY P.id`;

//   db.query(sql, (err, result) => {
//     if (err) {
//       return res.send({ status: 500, message: err.message });
//     }

//     const groupedData = [];

//     result.forEach((item) => {
//       const productId = item.product_id;

//       if (!groupedData[productId]) {
//         groupedData[productId] = [];
//       }
//       groupedData[productId].push(item);
//     });

//     const finalResult = Object.values(groupedData);

//     const r = finalResult.map((item) => {
//       const filtered = item.filter((el) => el.product_id);

//       // ✅ transform only stock data
//       const stocks = filtered.map((element) => ({
//         stock_id: element.stock_id,
//         purchase_date: element.purchase_date,
//         created_at: element.stock_created_at,
//         updated_at: element.stock_updated_at,
//         type: element.stock_type,
//         stock_quantity: element.stock_quantity,
//       }));

//       // ✅ calculate available qty
//       let available_qty = filtered.reduce((sum, el) => {
//         if (el.stock_type === "purchase") return sum + el.stock_quantity;
//         if (el.stock_type === "sale") return sum - el.stock_quantity;
//         return sum;
//       }, 0);

//       let balance_qty = filtered[0] ? filtered[0].product_quantity : 0;

//       // ✅ product object
//       const product = {
//         id: filtered[0].product_id,
//         name: filtered[0].product_name,
//         category_id: filtered[0].category_id,
//         image: filtered[0].image,
//         quantity: filtered[0].product_quantity,
//         description: filtered[0].description,
//         price: filtered[0].price,
//         created_at: filtered[0].product_created_at,
//         updated_at: filtered[0].product_updated_at,
//       };

//       // ✅ return one combined object
//       return {
//         stocks,        // array of stock entries
//         product,       // product details
//         available_qty,
//         balance_qty,
//       };
//     });

//     // ✅ send once, outside the loop
//     return res.send({ status: 200, message: r });
//   });
// });
  