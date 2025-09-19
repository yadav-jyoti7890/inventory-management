const express = require("express");
const router = express.Router();
const UserController = require("../controllers/usercontroller");

// Routes
router.post("/", UserController.addUser);         // Create
router.post("/getUsersBySorting", UserController.getUsers);         // Read all
router.get("/:id", UserController.getUserById);   // Read by ID
router.patch("/:id", UserController.updateUser);  // Update
router.delete("/:id", UserController.deleteUser); // Delete
router.post('/totalUserCount', UserController.totalUserCount)
router.post('/getSelectedData',  UserController.userSelectedRecords)

module.exports = router;
