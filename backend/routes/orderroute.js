const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/ordercontroller");
const OrderModel = require("../modles/ordermodel");

router.post("/", OrderController.addOrder); // Add order
// router.get("/", OrderController.getAllOrders); // Get all orders
router.delete("/:id", OrderController.deleteOrder); // Delete order
router.post("/totalTodayOrders", OrderController.getTotalTodayOrders)
router.post("/totalOrders", OrderController.totalOrders)
router.get("/getCustomers", OrderController.getCustomers)
router.post('/getAllOrders', OrderController.getAllOrders)

module.exports = router;
