const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productcontroller");
const upload = require("../middlewars/uploads"); // your multer config

router.post(
    "/",
    upload.fields([
        { name: "image", maxCount: 1 },
        { name: "photos", maxCount: 2 },
    ]),
    ProductController.createProduct
);
router.get("/", ProductController.getAllProducts);
router.get("/:id", ProductController.getProductById);
router.patch("/:id", upload.fields([
  { name: "image", maxCount: 1 },       // single image
  { name: "photos", maxCount: 10 }      // multiple images
]), ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);
router.post("/search", ProductController.searchProduct);
router.post("/exact-search", ProductController.exactSearchProduct);
router.get("/lowest-quantity", ProductController.getLowestQuantityProducts);
router.post("/getAllProducts", ProductController.getAllProductsCount);
router.post("/getCategory", ProductController.getAllCategory);
router.post("/getProductsBySorting", ProductController.getAllProducts)

module.exports = router;
