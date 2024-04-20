const express = require("express");
const router = express.Router();
const Order = require("../model/OrderModel");

const uuid = require("uuid");

// Middleware to check if user ID is sent with the request body
function validateUserId(req, res, next) {
  if (!req.body.user || !req.body.user._id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  next();
}

router.post("/", validateUserId, async (req, res) => {
  try {
    const userId = req.body.user._id; // Extract the ObjectId from the user object

    // Generate UUID for the order ID
    const orderId = "#" + uuid.v4().substring(0, 7);

    // Generate a random four-digit pin for the delivery pin
    const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();

    const orderData = {
      user: userId, // Use the extracted ObjectId
      price: req.body.price,
      deliveryFee: req.body.deliveryFee,
      quantity: req.body.quantity,
      name: req.body.name,
      totalFee: req.body.totalFee,
      orderId,
      deliveryPin,
    };

    const order = new Order(orderData);
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single order
router.get("/:id", getOrder, async (req, res) => {
  try {
    const orderId = req.params.id.trim(); // Remove potential whitespace
    const order = await Order.findById(orderId).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error(err); // Log for debugging
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Update an order
router.put("/:id", getOrder, async (req, res) => {
  try {
    Object.assign(res.order, req.body);
    await res.order.save();
    res.json(res.order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete an order
router.delete("/:id", async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Middleware to fetch order by ID
async function getOrder(req, res, next) {
  let order;
  try {
    order = await Order.findById(req.params.id);
    if (order == null) {
      return res.status(404).json({ message: "Order not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  res.order = order;
  next();
}

module.exports = router;

