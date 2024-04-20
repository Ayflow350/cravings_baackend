const express = require("express");

const User = require("../model/UserModel");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const checkAuth = require("../middleware/checkAuth.js");
require("dotenv").config();

const router = express.Router();

const { body, validationResult } = require("express-validator");

router.post(
  "/signup",
  body("email").isEmail().withMessage("The email is invalid"),
  body("password")
    .isLength({ min: 5 })
    .withMessage("The password is invalid"),
  body("name").notEmpty().withMessage("Name is required"),
  body("phoneNumber")
    .isLength({ min: 9, max: 9 })
    .withMessage("Phone number must have exactly 9 digits")
    .isNumeric()
    .withMessage("Phone number must contain only digits"),
  async (req, res) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      const errors = validationErrors.array().map((error) => {
        return {
          msg: error.msg,
        };
      });

      return res.json({ errors, data: null });
    }

    const { email, password, name, phoneNumber } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.json({
        errors: [
          {
            msg: "Email already in use",
          },
        ],
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // You need to handle stripeCustomerId appropriately; this is just a placeholder
    const newUser = await User.create({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      // stripeCustomerId: customer.id,
    });

    const token = await JWT.sign(
      { email: newUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: 360000,
      }
    );

    res.json({
      errors: [],
      data: {
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          name: newUser.name,
          phoneNumber: newUser.phoneNumber,
        },
      },
    });
  }
);

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

