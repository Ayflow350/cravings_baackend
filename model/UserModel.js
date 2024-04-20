const mongoose = require("mongoose");
const { Schema } = mongoose;

// Custom validator function to check if the phone number has exactly 9 digits
const validatePhoneNumber = function(phoneNumber) {
  const phoneNumberRegex = /^\d{11}$/;
  return phoneNumberRegex.test(phoneNumber);
};

const userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    min: 5,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: validatePhoneNumber,
      message: "Phone number must have exactly 11 digits",
    },
  },
});

module.exports = mongoose.model("User", userSchema);

