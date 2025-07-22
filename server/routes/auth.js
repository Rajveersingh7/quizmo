// auth.js - Authentication routes (register, login, verify)
import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import {
  validateRegistration,
  validateLogin,
  handleValidationErrors
} from "../middlewares/validation.js";

const router = express.Router();

// Register route
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {username, email, password} = req.body;

      const existingUser = await User.findOne({$or: [{email}, {username}]});

      if (existingUser) {
        const field = existingUser.email === email ? "email" : "username";
        return res.status(400).json({
          error: "USER_EXISTS",
          message: `User with this ${field} already exists`
        });
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        username,
        email,
        password: hashedPassword
      });

      await user.save();

      const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
        expiresIn: "7d"
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({
        error: "REGISTRATION_FAILED",
        message: "Failed to create account. Please try again."
      });
    }
  }
);

// Login route
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {email, password} = req.body;

      const user = await User.findOne({email});
      if (!user) {
        return res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password"
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          error: "INVALID_CREDENTIALS",
          message: "Invalid email or password"
        });
      }

      const token = jwt.sign({userId: user._id}, process.env.JWT_SECRET, {
        expiresIn: "7d"
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        error: "LOGIN_FAILED",
        message: "Login failed. Please try again."
      });
    }
  }
);

// Verify token route
router.get("/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "TOKEN_MISSING",
        message: "No token provided"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "USER_NOT_FOUND",
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(401).json({
      error: "INVALID_TOKEN",
      message: "Invalid token"
    });
  }
});

export default router;
