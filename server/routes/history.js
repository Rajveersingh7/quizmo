// history.js - Routes for quiz history (save, fetch, delete)
import express from "express";
import History from "../models/History.js";
import {authenticateToken} from "../middlewares/auth.js";

const router = express.Router();

// Save quiz history route
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {topic, difficulty, questionCount, score, totalQuestions} = req.body;

    const percentage = Math.round((score / totalQuestions) * 100);

    const history = new History({
      userId: req.user._id,
      topic,
      difficulty,
      questionCount,
      score,
      totalQuestions,
      percentage
    });

    await history.save();

    // Keep only the latest 10 history entries for the user
    const userHistory = await History.find({userId: req.user._id})
      .sort({createdAt: -1})
      .skip(10);
    if (userHistory.length > 0) {
      const idsToDelete = userHistory.map((h) => h._id);
      await History.deleteMany({_id: {$in: idsToDelete}});
    }

    res.status(201).json({
      success: true,
      message: "Quiz result saved successfully",
      data: history
    });
  } catch (error) {
    console.error("Save quiz history error:", error);
    res.status(500).json({
      error: "SAVE_FAILED",
      message: "Failed to save quiz result"
    });
  }
});

// Fetch quiz history route
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const quizHistory = await History.find({userId: req.user._id})
      .sort({createdAt: -1})
      .skip(skip)
      .limit(limit);

    const total = await History.countDocuments({userId: req.user._id});

    res.json({
      success: true,
      data: quizHistory,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: skip + quizHistory.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get quiz history error:", error);
    res.status(500).json({
      error: "FETCH_FAILED",
      message: "Failed to fetch quiz history"
    });
  }
});

// Delete all history route
router.delete("/", authenticateToken, async (req, res) => {
  try {
    await History.deleteMany({userId: req.user._id});
    res.json({success: true, message: "All quiz history deleted."});
  } catch (error) {
    console.error("Delete all quiz history error:", error);
    res.status(500).json({
      error: "DELETE_ALL_FAILED",
      message: "Failed to delete all quiz history"
    });
  }
});

// Delete a specific history entry for the logged-in user
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const {id} = req.params;
    const history = await History.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "History entry not found or not authorized."
      });
    }
    res.json({success: true, message: "Quiz history entry deleted."});
  } catch (error) {
    console.error("Delete quiz history entry error:", error);
    res.status(500).json({
      error: "DELETE_ONE_FAILED",
      message: "Failed to delete quiz history entry"
    });
  }
});

export default router;
