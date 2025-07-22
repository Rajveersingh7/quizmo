// validation.js - Middleware for validating user input on register/login
import {body, validationResult} from "express-validator";

// Registration validation rules
export const validateRegistration = [
  body("username")
    .trim()
    .isLength({min: 3, max: 30})
    .withMessage("Username must be in between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({min: 6})
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
];

// Login validation rules
export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required")
];

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: "Validation failed",
      details: errors.array()
    });
  }
  next();
};
