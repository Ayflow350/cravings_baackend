const express = require("express");
const router = express.Router();
const Product = require("../model/ProductModel");

// Create a new product
router.post("/", async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single product
router.get("/:id", getProduct, async (req, res) => {
    try {
      const productId = req.params.id.trim(); // Remove potential whitespace
      const product = await Product.findById(productId).lean();
  
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json(product);
    } catch (err) {
      console.error(err); // Log for debugging
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  

// Update a product
router.put("/:id", getProduct, async (req, res) => {
  try {
    Object.assign(res.product, req.body);
    await res.product.save();
    res.json(res.product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


router.delete("/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const deletedProduct = await Product.findByIdAndDelete(productId);
  
      if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
  
      res.json({ message: "Product deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Something went wrong" });
    }
  });
  
  
  
// Middleware to fetch product by ID
async function getProduct(req, res, next) {
  let product;
  try {
    product = await Product.findById(req.params.id);
    if (product == null) {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.product = product;
  next();
}

module.exports = router;
