const express = require("express");

const User = require("../model/UserModel");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth.js");
require("dotenv").config();

const router = express.Router();






router.post("/signup", async (req, res) => {

  try {
    const { email, password, name, phoneNumber } = req.body;
    console.log("Incoming data:", req.body);

    // Add basic checks for null or undefined values
    if (!email || !password || !name) {
      return res.status(400).json({
        msg: "Invalid value: Missing required fields.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
    });

    const token = await JWT.sign(
      { email: newUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: 360000,
      }
    );

    res.json({
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          phoneNumber,
        },
      },
    });
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      msg: "An internal error occurred.",
    });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.json({
      errors: [
        {
          msg: "Invalid credentials",
        },
      ],
      data: null,
    });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.json({
      errors: [
        {
          msg: "Invalid credentials",
        },
      ],
      data: null,
    });
  }

  const token = await JWT.sign(
    { email: user.email },
    process.env.JWT_SECRET,
    {
      expiresIn: 360000,
    }
  );

  return res.json({
    errors: [],
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    },
  });
});

router.get("/me", checkAuth, async (req, res) => {
  const user = await User.findOne({ email: req.user });

  return res.json({
    errors: [],
    data: {
      user: {
        id: user._id,
        email: user.email,
      },
    },
  });
});

router.post("/logout", (req, res) => {
  // Assuming you are using JWT for authentication, you can simply clear the JWT token stored on the client side
  // For example, you can send an empty JWT token in the response
  res.json({
    errors: [],
    data: {
      token: "",
    },
  });
});

module.exports = router;

