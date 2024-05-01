const express = require('express');
const router = express.Router();
const axios = require('axios');
const mongoose = require('mongoose');
const uuid = require("uuid");
// Generate a unique order ID

require('../model/OrderModel'); // Ensure the Order model is registered
const API_KEY = 'sk_test_48dd050600ed47e32459d1e2fcac5f037403c728'; // Ensure this API key is not exposed in production

// Post endpoint to create a new order
router.post('/create', async (req, res, next) => {
  const { email, reference, metadata } = req.body; 
  const orderId = "#" + uuid.v4().substring(0, 7);
  if (!email || !reference || !metadata) {
    return res.status(400).json({ message: 'Please provide all the required fields.' });
  }

  console.log(`Verifying transaction with reference: ${reference.reference}`);
  const url = `https://api.paystack.co/transaction/verify/${reference.reference}`;
  console.log('Parsing URL:', url);
  console.log('metadata:', metadata);

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const Order = mongoose.model('order');
    const order = new Order({
      email,
      orderId, 
      reference: reference.reference,
      userId: metadata.userId,
      products: metadata.products,
      total: metadata.total,
      deliveryLocation: metadata.deliveryLocation,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    if (response.data.data.status === 'success') {
      order.status = 'paid';
      order.amount = response.data.data.amount / 100;
      const savedOrder = await order.save();
      return res.json({ status: true, message: 'Order placed successfully!', order: savedOrder });
    } else {
      order.status = 'abandoned';
      order.amount = response.data.data.amount / 100;
      const savedOrder = await order.save();
      return res.status(400).json({ status: false, message: 'Transaction failed.', order: savedOrder });
    }
  } catch (error) {
    console.error('Error during transaction verification', error);
    return res.status(400).json({ status: false, message: 'Transaction failed.', error: error.response?.data?.message || error.message });
  }
});

module.exports = router;





router.get('/orders/user/:userId', async (req, res) => {
  const { userId } = req.params; // Extract userId from request parameters
  const Order = mongoose.model('order');

  try {
    // Check if userId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ status: false, message: 'Invalid User ID format' });
    }

    // Fetch orders by userId
    const orders = await Order.find({ userId }).sort({ createdAt: -1 }); // Fetch and sort by most recent

    if (orders.length === 0) {
      // No orders found for the given userId
      return res.status(404).json({ status: false, message: 'No orders found for this User ID' });
    }

    
    return res.json({ status: true, orders });
  } catch (error) {
    console.error('Error fetching orders by User ID:', error);
    return res.status(500).json({ status: false, message: 'Error fetching orders.', error: error.message });
  }
});

module.exports = router; 


router.get('/fetch', async (req, res, next) => {
  try {
    const Order = mongoose.model('order'); // Reference to the Order model
    Order.find({})
      .sort({ updatedAt: -1 }) // Sort by the updatedAt field in descending order
      .then((orders) => {
        res.json({ status: true, orders }); // Return the fetched orders
      })
      .catch((err) => {
        console.log('Error fetching orders:', err);
        res.status(500).json({ status: false, message: 'Error fetching orders.', error: err });
      });
  } catch (e) {
    console.error('Exception caught during fetch:', e);
    res.status(500).json({ status: false, message: 'Error fetching orders.', error: e.message });
  }
});

