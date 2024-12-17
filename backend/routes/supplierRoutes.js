const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const mongoose = require("mongoose");

// Supplier Schema
const SupplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: String, required: true },
});

const Supplier = mongoose.model("Supplier", SupplierSchema);

// POST - Add a new supplier
router.post(
  "/suppliers",
  [
    body("name").notEmpty().withMessage("Name is required"),
    body("phone").notEmpty().withMessage("Phone number is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("address").notEmpty().withMessage("Address is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, phone, email, address } = req.body;

      // Check for duplicate email
      const existingSupplier = await Supplier.findOne({ email });
      if (existingSupplier) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const supplier = new Supplier({ name, phone, email, address });
      await supplier.save();
      res.status(201).json({ message: "Supplier added successfully", supplier });
    } catch (error) {
      res.status(500).json({ error: "Failed to add supplier" });
    }
  }
);

// GET - Fetch all suppliers
router.get("/suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json({ suppliers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch suppliers" });
  }
});

// PUT - Update a supplier
router.put("/suppliers:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedSupplier) return res.status(404).json({ error: "Supplier not found" });

    res.json({ message: "Supplier updated successfully", supplier: updatedSupplier });
  } catch (error) {
    res.status(500).json({ error: "Failed to update supplier" });
  }
});

// DELETE - Remove a supplier
router.delete("/suppliers:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedSupplier = await Supplier.findByIdAndDelete(id);
    if (!deletedSupplier) return res.status(404).json({ error: "Supplier not found" });

    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete supplier" });
  }
});

module.exports = router;
