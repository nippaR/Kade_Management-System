const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");



const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB connection
const MONGO_URI = "mongodb+srv://dinushadeshan5:Wije%4020010616@kade-managment-system.7cq6x.mongodb.net/?retryWrites=true&w=majority&appName=Kade-Managment-System&authMechanism=SCRAM-SHA-1";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/users", userRoutes);


// Home Route


// Multer File Upload Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create directory if not exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size of 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, and GIF files are allowed."));
    }
  },
}).single("profilePicture");

// File Upload Route
app.post("/api/users/upload-profile-picture", (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (req.file) {
      res.status(200).json({
        message: "File uploaded successfully!",
        profilePicture: req.file.filename,
      });
    } else {
      res.status(400).json({ error: "No file uploaded." });
    }
  });
});

// Serve Uploaded Files
app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  res.sendFile(filePath);
});

// Dummy Data
let inventory = [
  { productId: 1, name: "Product A", stock: 50, price: 100 },
  { productId: 2, name: "Product B", stock: 30, price: 150 },
  { productId: 3, name: "Product C", stock: 20, price: 200 },
];

let sales = [];

// Routes

// Get inventory
app.get("/inventory", (req, res) => {
  res.status(200).json({ inventory });
});

// Add a sale
app.post(
  "/sales",
  [
    body("productId").isInt({ gt: 0 }).withMessage("Invalid product ID."),
    body("quantity").isInt({ gt: 0 }).withMessage("Quantity must be a positive integer."),
    body("discount").isFloat({ min: 0 }).withMessage("Discount must be a positive number."),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity, discount } = req.body;

    const product = inventory.find((item) => item.productId === productId);

    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ error: "Insufficient stock available." });
    }

    const totalPrice = product.price * quantity - discount;

    const newSale = {
      productId,
      productName: product.name,
      quantity,
      date: new Date().toISOString(),
      totalPrice,
    };

    sales.push(newSale);

    inventory = inventory.map((item) =>
      item.productId === productId ? { ...item, stock: item.stock - quantity } : item
    );

    res.status(201).json({ message: "Sale recorded successfully.", sale: newSale });
  }
);

// Get sales summary
app.get("/sales/summary", (req, res) => {
  const now = new Date();

  const dailySales = sales.filter(
    (sale) => new Date(sale.date).toDateString() === now.toDateString()
  );
  const weeklySales = sales.filter(
    (sale) => new Date(sale.date) > new Date(now.setDate(now.getDate() - 7))
  );
  const monthlySales = sales.filter(
    (sale) => new Date(sale.date).getMonth() === now.getMonth()
  );

  const summary = {
    daily: dailySales.reduce((acc, sale) => acc + sale.totalPrice, 0),
    weekly: weeklySales.reduce((acc, sale) => acc + sale.totalPrice, 0),
    monthly: monthlySales.reduce((acc, sale) => acc + sale.totalPrice, 0),
  };
})


// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
