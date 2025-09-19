// backend/controllers/categoryController.js
const CategoryModel = require("../modles/categorymodel");

const CategoryController = {
  addCategory: (req, res) => {
    const { name } = req.body;
    console.log(name, req.body);

    if (!name) return res.status(400).send({ status: 400, message: "Category name required" });

    CategoryModel.create(name, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Category added successfully" });
    });
  },

  getAllCategories: (req, res) => {
    CategoryModel.findAll((err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Get categories", categories: result });
    });
  },

  getCategoryById: (req, res) => {
    const { id } = req.params;
    CategoryModel.findById(id, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      if (result.length === 0) return res.status(404).send({ status: 404, message: "Category not found" });
      res.send({ status: 200, message: "Get category", category: result[0] });
    });
  },

  //❌
  updateCategory: (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).send({ status: 400, message: "Category name required" });

    CategoryModel.update(id, name, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Category updated successfully" });
    });
  },

  deleteCategory: (req, res) => {
    const { id } = req.params;
    if (!id)
      return res.status(400).send({ status: 400, message: "Category id required" });

    // Step 1 & 2: Check if category exists and if used in product using two queries
    CategoryModel.findById(id, (err, categoryResult) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });

      if (categoryResult.length === 0) {
        // Category does not exist
        return res.status(404).send({ status: 404, message: "Category not exists" });
      }

      // Step 2: Check if used in product
      CategoryModel.checkCategoryUsedInProduct(id, (err, productResult) => {
        if (err) return res.status(500).send({ status: 500, message: err.message });

        if (productResult.length > 0) {
          return res.status(400).send({
            status: 400,
            message: "Category is used in products, cannot delete",
          });
        }

        // Step 3: Delete category
        CategoryModel.delete(id, (err, deleteResult) => {
          if (err) return res.status(500).send({ status: 500, message: err.message });

          res.send({ status: 200, message: "Category deleted successfully" });
        });
      });
    });
  },


  searchCategory: (req, res) => {
    console.log("searchcategory");
    console.log(req.body);
    
    const { searchValue } = req.body;
    if (!searchValue) return res.status(400).send({ status: 400, message: "Search value required" });

    CategoryModel.searchByName(searchValue, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Search results", searchCategoryResponse: result });
    });
  },

  getAllCategoriesCount: (req, res) => {
    console.log("getAllCategoriesCount");
    CategoryModel.getAllCategoriesCount((err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      const count = result && result[0] ? result[0].categoryCount : 0;
      res.send({ status: 200, message: "getAllCategoriesCount", totalCategories: count })
    })
  },

  // getAllCategoryBySorting: (req, res) => {
  //   console.log("getAllCategoryBySorting");
  //   let { page = 1, limit = 5, sortBy = null, sortDir = null } = req.body;

  //   page = parseInt(page);
  //   limit = parseInt(limit);
  //   const offset = (page - 1) * limit;

  //   CategoryModel.getAllWithPagination(limit, offset, sortBy, sortDir, (err, categories, total) => {
  //     if (err) return res.status(500).json({ status: 500, message: err.message });

  //     res.json({
  //       status: 200,
  //       categories,
  //       total,
  //       page,
  //       limit,
  //       sortBy,
  //       sortDir
  //     });
  //   });
  // },

  getAllCategoryBySorting: (req, res) => {
    console.log("getAllCategoryBySorting");
    const searchValue = req.body.searchValue || '';
    const page = req.body.page || 1;
    const pageSize = req.query.pageSize || 5;
    const sortBy = req.body.sortBy || 'name';
    const sortOrder = req.body.sortDir || asc;


    CategoryModel.getAllCategoryBySorting(searchValue, page, pageSize, sortBy, sortOrder, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err });
      }
      res.json(data);
    });
  },

};


module.exports = CategoryController;
