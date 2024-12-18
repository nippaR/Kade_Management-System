// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const userRoutes = require("./routes/userRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
const { User, ActivityLog } = require("./models/User");



// Configure Multer to store files in the "uploads" folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // The directory where files will be stored
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Generate a unique filename
  },
});
const upload = multer({ storage });

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
  totalPrice: { type: Number },
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);
const StockMovement = mongoose.model("StockMovement", StockMovementSchema);

// Routes
app.use("/api/users", userRoutes);
app.use("/api", supplierRoutes); // Make sure this is included and correct


// Product Routes
app.post(
  "/products",
  [
    body("productId").isInt(),
    body("name").isString().isLength({ min: 3 }),
    body("price").isFloat({ gt: 0 }),
    body("stock").isInt({ min: 0 }),
    body("category").isString().notEmpty(),
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

app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
});

app.put(
  "/products/:productId",
  [
    body("name").optional().isString().isLength({ min: 3 }),
    body("price").optional().isFloat({ gt: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("category").optional().isString().notEmpty(),
    body("reorderLevel").optional().isInt({ gt: 0 }),
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

// Stock Movements
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

      let totalPrice = 0;
      if (type === "restock") {
        product.stock += quantity;
      } else if (type === "sale") {
        product.stock -= quantity;
        totalPrice = product.price * quantity;
      }

      await product.save();

      const newMovement = new StockMovement({
        productId,
        productName: product.name,
        type,
        quantity,
        totalPrice,
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

app.get("/stock-movements", async (req, res) => {
  try {
    const stockMovements = await StockMovement.find().sort({ date: -1 });
    res.json({ stockMovements });
  } catch (error) {
    res.status(500).json({ error: "Error fetching stock movements." });
  }
});

app.get("/products/low-stock", async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ $expr: { $lt: ["$stock", "$reorderLevel"] } });
    res.json({ lowStockProducts });
  } catch (error) {
    res.status(500).json({ error: "Error fetching low-stock products" });
  }
});

app.post("/reorder/process", async (req, res) => {
  const { reorderList } = req.body;

  if (!Array.isArray(reorderList) || reorderList.length === 0) {
    return res.status(400).json({ error: "Reorder list is invalid or empty." });
  }

  try {
    for (const item of reorderList) {
      const { productId, reorderQuantity } = item;

      const product = await Product.findOne({ productId });
      if (!product) return res.status(404).json({ error: `Product with ID ${productId} not found.` });

      product.stock += reorderQuantity;
      await product.save();

      const stockMovement = new StockMovement({
        productId,
        productName: product.name,
        type: "restock",
        quantity: reorderQuantity,
      });
      await stockMovement.save();
    }

    res.json({ message: "Reorder processed successfully." });
  } catch (error) {
    res.status(500).json({ error: "Error processing reorder." });
  }
});

// Load suppliers and send email
// Supplier Notification Route
app.post("/notify-suppliers", async (req, res) => {
  const { reorderList } = req.body;

  if (!Array.isArray(reorderList) || reorderList.length === 0) {
    return res.status(400).json({ error: "Reorder list is invalid or empty." });
  }

  try {
    // Fetch suppliers
    const suppliers = await Supplier.find();
    if (!suppliers.length) return res.status(404).json({ error: "No suppliers found." });

    // Load logo image safely
    const logoPath = path.join(__dirname, "images", "kade2.png");
    if (!fs.existsSync(logoPath)) throw new Error("Logo image not found.");
    const logoBase64 = fs.readFileSync(logoPath, "base64");

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "dinushadeshan4@gmail.com",
        pass: "oqax fsvx gtue mlmb", // Replace with Gmail App Password
      },
    });

    // Prepare email content
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.5;">
        <img src="data:image/png;base64,${logoBase64}" alt="Logo" style="width: 150px; margin-bottom: 20px;" />
        <h2>Reorder Notification</h2>
        <p>Dear Supplier,</p>
        <p>The following products need to be reordered:</p>
        <table border="1" cellspacing="0" cellpadding="10" style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th>Product Name</th>
              <th>Reorder Quantity</th>
            </tr>
          </thead>
          <tbody>
            ${reorderList.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.reorderQuantity}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p>Please process this order at your earliest convenience.</p>
        <p>Thank you.<br><strong>Kade Management Team</strong></p>
      </div>
    `;

    // Send emails to all suppliers
    const emailPromises = suppliers.map(supplier =>
      transporter.sendMail({
        from: '"Kade Management" <dinushadeshan4@gmail.com>',
        to: supplier.email,
        subject: "Reorder Notification",
        html: emailHTML,
      })
    );

    await Promise.all(emailPromises);
    console.log("Emails sent to suppliers.");
    res.json({ message: "Suppliers notified successfully." });
  } catch (error) {
    console.error("Error notifying suppliers:", error.message);
    res.status(500).json({ error: "Error notifying suppliers." });
  }
});

// Settings
const SettingsSchema = new mongoose.Schema({
  shopName: String,
  logo: String,
  contactInfo: String,
  taxRate: Number,
  discount: Number,
  emailAlerts: Boolean,
});

const Settings = mongoose.model("Settings", SettingsSchema);

app.post("/api/settings", async (req, res) => {
  try {
    const settings = new Settings(req.body);
    await Settings.deleteMany(); // Clear existing settings
    await settings.save();
    res.status(200).send("Settings saved successfully!");
  } catch (error) {
    res.status(500).send("Failed to save settings: " + error.message);
  }
});

app.post("/api/restore", upload.single("backupFile"), (req, res) => {
  const backupFile = req.file;
  if (!backupFile) return res.status(400).send("No file uploaded.");

  // TODO: Add logic to handle the uploaded backup file (e.g., restoring the database)
  console.log("File uploaded:", backupFile);

  res.status(200).send("Backup restored successfully.");
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
