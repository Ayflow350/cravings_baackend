// product.js
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  contentItems: {
    type: [String],
    required: true
  },
  extraItems: {
    type: [String],
    required: true
  },
  foodPicture: {
    type: String, 
    required: true
  }
});

module.exports = mongoose.model("Product", productSchema);
