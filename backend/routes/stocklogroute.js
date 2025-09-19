const express = require("express");
const router = express.Router();
const StockController = require("../controllers/stocklogcontroller");

router.get("/", StockController.getAvailableQty); // GET available qty

module.exports = router;
