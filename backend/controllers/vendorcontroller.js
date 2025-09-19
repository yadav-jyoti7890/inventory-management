const VendorModel = require("../modles/vendormodel");

const VendorController = {
  addVendor: (req, res) => {
    const { name, contact, address } = req.body;
    if (!name || !contact || !address) {
      return res.status(400).send({ status: 400, message: "All fields are required" });
    }

    VendorModel.create({ name, contact, address }, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Vendor added successfully" });
    });
  },

  getAllVendors: (req, res) => {
    console.log("get all vendors");
    console.log(req.body);
    
    const searchValue = req.body.searchValue || '';
    const page = req.body.page || 1;
    const pageSize = req.query.pageSize || 5;
    const sortBy = req.body.sortBy || 'name';
    const sortOrder = req.body.sortDir || 'asc'
    // console.log(searchValue, page, pageSize, sortBy, sortOrder, "get all vendors");
    
    VendorModel.findAll(searchValue, page, pageSize, sortBy, sortOrder, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Server error', error: err });
      }
      res.json(data);
    });
  },

  getVendorById: (req, res) => {
    const { id } = req.params;
    VendorModel.findById(id, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      if (result.length === 0) return res.status(404).send({ status: 404, message: "Vendor not found" });
      res.send({ status: 200, message: "Get vendor", vendor: result[0] });
    });
  },

  updateVendor: (req, res) => {
    const { id } = req.params;
    const { name, contact, address } = req.body;
    VendorModel.update(id, { name, contact, address }, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: err.message });
      res.send({ status: 200, message: "Vendor updated successfully" });
    });
  },

  deleteVendor: (req, res) => {
    const { id } = req.params;
    VendorModel.findVendorById(id, (err, result) => {
      if (err) return res.status(500).send({ status: 500, message: "server error" });
      else if (result.length > 0) return res.status(400).send({ status: 400, message: "vendor exits on other table you can delete it" })
      else {
        VendorModel.delete(id, (err, result) => {
          if (err) return res.status(500).send({ status: 500, message: err.message });
          res.send({ status: 200, message: "Vendor deleted successfully" });
        });
      }
    })

  },

  totalVendorsCount: (req, res) => {
    VendorModel.totalVendorsCount((err, result) => {
      if (err) {
        return res.status(500).json({ status: 500, message: err.message });
      }
      const count = result && result[0] ? result[0].count : 0;

      return res.status(200).json({
        status: 200,
        message: "totalVendorsCount",
        totalVendorsCount: count
      });
    });
  }
};

module.exports = VendorController;
