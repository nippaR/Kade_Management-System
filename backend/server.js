const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = "mongodb+srv://dinushadeshan5:Wije%4020010616@kade-managment-system.7cq6x.mongodb.net/?retryWrites=true&w=majority&appName=Kade-Managment-System&authMechanism=SCRAM-SHA-1";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
