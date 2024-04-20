const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
},
email: {
  type: String,
  required: true
},
   
    reference: {
        type: String,
        unique: true,
        required: true 
      },

      products: [{
        name: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        price: {
            type: Number,
            required: true
        }
    }],

    total: {
      type: Number,
      required: true
  },
    status: String,
    createdAt: Date,
    updatedAt: Date,
    amount: Number
});

const Order = mongoose.model('order', orderSchema);
module.exports = Order;


