// backend/routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categorycontroller");

router.post("/", CategoryController.addCategory);
router.get("/", CategoryController.getAllCategories);
router.get("/:id", CategoryController.getCategoryById);
router.patch("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);
router.post("/search", CategoryController.searchCategory);
router.post("/getAllCategory", CategoryController.getAllCategoriesCount);
router.post("/getCategoryBySorting", CategoryController.getAllCategoryBySorting)

module.exports = router;
