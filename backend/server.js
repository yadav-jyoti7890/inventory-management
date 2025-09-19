const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userroute");
const categoryRoutes = require("./routes/categoryroute");
const product = require("./routes/productroute");
const vendors = require("./routes/vendorroute");
const purchase = require("./routes/purchaseroute");
const orders = require("./routes/orderroute");
const stockRoutes = require("./routes/stocklogroute");
const port = 3000;
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes); //✅
app.use("/api/categories", categoryRoutes); //✅
app.use("/api/products", product); //✅❌ //
app.use("/api/vendors", vendors); //✅ all api runs
app.use("/api/purchase", purchase); // ✅
app.use("/api/orders", orders);
app.use("/api/stock", stockRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use("/upload", express.static(path.join(__dirname, "upload")));

