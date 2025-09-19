const UserModel = require('../modles/usermodel')

const UserController = {
  addUser: (req, res) => {
    UserModel.create(req.body, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      return res.send({ status: 200, message: "User added successfully" });
    });
  },

  getUsers: (req, res) => {
    console.log("get all users");
    
    const searchValue = req.body.searchValue || '';
    const page = req.body.page || 1;
    const pageSize = req.query.pageSize || 5;
    const sortBy = req.body.sortBy || 'name';
    const sortOrder = req.body.sortDir || asc;
    console.log(searchValue, page, pageSize, sortBy, sortOrder);
    
    UserModel.findAll(searchValue, page, pageSize, sortBy, sortOrder, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err });
      }
      res.json(data);
    });
  },

  getUserById: (req, res) => {
    const { id } = req.params;
    UserModel.findById(id, (err, result) => {
      if (err) return res.status(500).json({ status: 500, message: err.message });
      if (result.length === 0) return res.status(404).json({ status: 404, message: "User not found" });
      res.json({ status: 200, message: "get user", user: result[0] });
    });
  },

  updateUser: (req, res) => {
    const { id } = req.params;
    UserModel.update(id, req.body, (err, result) => {
      if (err) return res.status(500).json({ status: 500, message: err.message });
      res.json({ status: 200, message: "User updated successfully" });
    });
  },

  deleteUser: (req, res) => {
    const { id } = req.params;
    UserModel.findUser(id, (err, result) => {
      if (err) return res.status(500).json({ status: 500, message: err.message });
      else if (result.length > 0) {
        return res.status(400).json({ status: 400, message: "user exits on other table you can delete it" })
      }
      else {
        UserModel.delete(id, (err, result) => {
          if (err) return res.status(500).json({ status: 500, message: err.message });
          res.json({ status: 200, message: "User deleted successfully" });
        });
      }
    })

  },

  totalUserCount: (req, res) => {
    UserModel.totalUserCount((err, result) => {
      if (err) {
        return res.status(500).json({ status: 500, message: err.message });
      }
      const count = result && result[0] ? result[0].count : 0;

      return res.status(200).json({
        status: 200,
        message: "totalUserCount",
        TotalUsers: count
      });
    });
  },

  userSelectedRecords: (req, res)=>{
    console.log("userSelectedRecords");
    const value = parseInt(req.body.value);
    const offset = 0
    console.log(value);
    UserModel.getSelectedData(value, offset, (err, result) =>{
      if(err) return res.send({status: 500, message: err.message})
       return res.send({status:200, message: "userSelectedRecords", userSelectData: result})
    })
  }

};

module.exports = UserController;
