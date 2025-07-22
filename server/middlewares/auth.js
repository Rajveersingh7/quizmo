// auth.js - Middleware to authenticate JWT tokens for protected routes
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "ACCESS_TOKEN_REQUIRED",
        message: "Access token is required"
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

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "TOKEN_EXPIRED",
        message: "Token has expired"
      });
    }

    return res.status(403).json({
      error: "INVALID_TOKEN",
      message: "Invalid token"
    });
  }
};
