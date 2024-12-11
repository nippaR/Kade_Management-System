const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB URI
const MONGO_URI = "mongodb+srv://dinushadeshan5:Wije%4020010616@kade-managment-system.7cq6x.mongodb.net/?retryWrites=true&w=majority&appName=Kade-Managment-System&authMechanism=SCRAM-SHA-1";

// MongoDB connection
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Models
const ProductSchema = new mongoose.Schema({
  productId: { type: Number, unique: true, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  reorderLevel: { type: Number, default: 10 },
  category: { type: String, required: true },
});

const StockMovementSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  productName: { type: String, required: true },
  type: { type: String, enum: ["restock", "sale", "adjustment"], required: true },
  quantity: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);
const StockMovement = mongoose.model("StockMovement", StockMovementSchema);

// Routes
app.use("/api/users", userRoutes);

// Add new product
app.post(
  "/products",
  [
    body("productId").isInt().withMessage("Product ID must be an integer"),
    body("name").isString().isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    body("category").isString().notEmpty().withMessage("Category is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId, name, price, stock, reorderLevel, category } = req.body;

    try {
      const productExists = await Product.findOne({ productId });
      if (productExists) return res.status(400).json({ error: "Product with this ID already exists." });

      const product = new Product({ productId, name, price, stock, reorderLevel, category });
      await product.save();

      res.status(201).json({ message: "Product added successfully", product });
    } catch (error) {
      res.status(500).json({ error: "Failed to add product." });
    }
  }
);

// Fetch all products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

// Update product
app.put(
  "/products/:productId",
  [
    body("name").optional().isString().isLength({ min: 3 }).withMessage("Name must be at least 3 characters long"),
    body("price").optional().isFloat({ gt: 0 }).withMessage("Price must be a positive number"),
    body("stock").optional().isInt({ min: 0 }).withMessage("Stock must be a non-negative integer"),
    body("category").optional().isString().notEmpty().withMessage("Category is required"),
    body("reorderLevel").optional().isInt({ gt: 0 }).withMessage("Reorder level must be a positive integer"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { productId } = req.params;
    const updates = req.body;

    try {
      const updatedProduct = await Product.findOneAndUpdate({ productId }, updates, { new: true });
      if (!updatedProduct) return res.status(404).json({ error: "Product not found" });

      res.json({ message: "Product updated successfully", product: updatedProduct });
    } catch (error) {
      res.status(500).json({ error: "Error updating product" });
    }
  }
);

// Delete product
app.delete("/products/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const deletedProduct = await Product.findOneAndDelete({ productId });
    if (!deletedProduct) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting product" });
  }
});

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

// Fetch stock movements
app.get("/stock-movements", async (req, res) => {
  try {
    const stockMovements = await StockMovement.find().sort({ date: -1 });
    res.json({ stockMovements });
  } catch (error) {
    res.status(500).json({ error: "Error fetching stock movements." });
  }
});

// Fetch low-stock alerts
app.get("/products/low-stock", async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ $expr: { $lt: ["$stock", "$reorderLevel"] } });
    res.json({ lowStockProducts });
  } catch (error) {
    res.status(500).json({ error: "Error fetching low-stock products" });
  }
});

// Server setup
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
