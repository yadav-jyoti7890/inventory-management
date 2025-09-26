const express = require("express");
const router = express.Router();
const PurchaseController = require("../controllers/purchasecontroller");

// CRUD routes
router.post("/", PurchaseController.addPurchase); // Add purchase
router.post("/getPurchaseData", PurchaseController.getPurchaseData); //✅ 
router.patch("/:id", PurchaseController.updatePurchase); //❌  // Update purchase
router.get("/getVendors", PurchaseController.getVendors)
router.get("/getProducts", PurchaseController.getProducts)
router.get("/getPurchaseDataById/:id", PurchaseController.getPurchaseDataById)
router.post("/getTotalPurchase", PurchaseController.getTotalPurchase)
router.post("/getTodayPurchase", PurchaseController.getTodayPurchase)




module.exports = router;
// router.get("/", PurchaseController.getAllPurchases); 
