const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB URI
const MONGO_URI =
  "mongodb+srv://dinushadeshan5:Wije%4020010616@kade-managment-system.7cq6x.mongodb.net/?retryWrites=true&w=majority&appName=Kade-Managment-System&authMechanism=SCRAM-SHA-1";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Models
const ProductSchema = new mongoose.Schema({
  productId: Number,
  name: String,
  stock: Number,
  price: Number,
  reorderLevel: { type: Number, default: 10 }, // Default reorder level
});

const StockMovementSchema = new mongoose.Schema({
  productId: Number,
  productName: String,
  type: { type: String, enum: ["restock", "sale", "adjustment"] },
  quantity: Number,
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);
const StockMovement = mongoose.model("StockMovement", StockMovementSchema);

// Routes
app.use("/api/users", userRoutes);

// Fetch all inventory
app.get("/inventory", async (req, res) => {
  try {
    const inventory = await Product.find();
    res.json({ inventory });
  } catch (error) {
    res.status(500).json({ error: "Error fetching inventory." });
  }
});

// Fetch stock movements
app.get("/stock-movements", async (req, res) => {
  try {
    const stockMovements = await StockMovement.find().sort({ date: -1 });
    res.json({ stockMovements });
  } catch (error) {
    res.status(500).json({ error: "Error fetching stock movements." });
  }
});

// Update reorder level for a product
app.put(
  "/inventory/:productId/reorder-level",
  [body("reorderLevel").isInt({ gt: 0 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId } = req.params;
    const { reorderLevel } = req.body;

    try {
      const product = await Product.findOne({ productId });
      if (!product) return res.status(404).json({ error: "Product not found." });

      product.reorderLevel = reorderLevel;
      await product.save();

      res.json({
        message: "Reorder level updated successfully.",
        updatedInventory: await Product.find(),
      });
    } catch (error) {
      res.status(500).json({ error: "Error updating reorder level." });
    }
  }
);

// Log stock movements (restock, sale, or adjustment)
app.post(
  "/stock-movements",
  [
    body("productId").isInt(),
    body("type").isIn(["restock", "sale", "adjustment"]),
    body("quantity").isInt({ gt: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, type, quantity } = req.body;

    try {
      const product = await Product.findOne({ productId });
      if (!product) return res.status(404).json({ error: "Product not found." });

      if (type === "sale" && product.stock < quantity) {
        return res.status(400).json({ error: "Insufficient stock for sale." });
      }

      // Update stock based on the movement type
      if (type === "restock") product.stock += quantity;
      else if (type === "sale") product.stock -= quantity;

      await product.save();

      // Log the stock movement
      const newMovement = new StockMovement({
        productId,
        productName: product.name,
        type,
        quantity,
      });
      await newMovement.save();

      res.json({
        message: "Stock movement logged successfully.",
        updatedInventory: await Product.find(),
      });
    } catch (error) {
      res.status(500).json({ error: "Error logging stock movement." });
    }
  }
);

// Fetch low-stock alerts
app.get("/low-stock-alerts", async (req, res) => {
  try {
    const lowStockItems = await Product.find({ $expr: { $lt: ["$stock", "$reorderLevel"] } });
    res.json({ lowStockItems });
  } catch (error) {
    res.status(500).json({ error: "Error fetching low-stock alerts." });
  }
});

// Server setup
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
