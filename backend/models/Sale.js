const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory", required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Sale", saleSchema);
