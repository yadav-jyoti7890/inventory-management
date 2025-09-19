const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/ordercontroller");

router.post("/", OrderController.addOrder); // Add order
router.get("/", OrderController.getAllOrders); // Get all orders
router.delete("/:id", OrderController.deleteOrder); // Delete order
router.post("/totalTodayOrders", OrderController.getTotalTodayOrders)
router.post("/totalOrders", OrderController.totalOrders)

module.exports = router;
