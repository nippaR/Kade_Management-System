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

// Multer file upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir); // Create directory if not exists
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Use current timestamp to generate unique filename
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Max file size of 5MB
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Only JPEG, PNG, and GIF files are allowed.");
    }
  }
}).single("profilePicture"); // Field name is 'profilePicture'

// POST route for uploading profile picture
app.post("/api/users/upload-profile-picture", (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).send({ message: err.message });
    } else if (err) {
      return res.status(400).send({ message: err });
    }

    if (req.file) {
      res.status(200).send({
        message: "File uploaded successfully!",
        profilePicture: req.file.filename // Send filename of the uploaded picture
      });
    } else {
      res.status(400).send({ message: "No file uploaded." });
    }
  });
});

// Route for serving the uploaded profile picture
app.get("/uploads/:filename", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.filename);
  res.sendFile(filePath);
});

// Use userRoutes for any other user-related API routes
app.use("/api/users", userRoutes);

// Start the server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
