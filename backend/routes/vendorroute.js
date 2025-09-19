const express = require("express");
const router = express.Router();
const VendorController = require("../controllers/vendorcontroller");

// CRUD Routes
router.post("/", VendorController.addVendor);          // Add vendor
router.post("/sortingData", VendorController.getAllVendors);      // Get all vendors
router.get("/:id", VendorController.getVendorById);   // Get vendor by ID
router.patch("/:id", VendorController.updateVendor);  // Update vendor
router.delete("/:id", VendorController.deleteVendor); // Delete vendor
router.post("/totalVendorsCount", VendorController.totalVendorsCount); 

module.exports = router;
