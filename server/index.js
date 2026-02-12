// index.js - Main server file for Quizmo backend
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import {GoogleGenAI} from "@google/genai";
import authRoutes from "./routes/auth.js";
import historyRoutes from "./routes/history.js";
import {authenticateToken} from "./middlewares/auth.js";

dotenv.config();

// Create Express app and set port
const app = express();
const port = process.env.PORT || 5000;

// Middleware setup (CORS, JSON parsing)
const allowedOrigins = ["https://quizmoai.vercel.app", "http://localhost:5173"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);
app.use(express.json());

// API routes for authentication and history
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

// Google GenAI setup for quiz generation
const ai = new GoogleGenAI({apiKey: process.env.GOOGLE_API_KEY});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/quizmo")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Root route
app.get("/", (req, res) => {
  res.send("Get request received");
});

// Route to generate quiz using AI
app.post("/api/generate", async (req, res) => {
  const {topic, difficulty = "easy", questionCount = 3} = req.body;

  // Generate difficulty-specific instructions
  const getDifficultyInstructions = (level) => {
    switch (level) {
      case "easy":
        return "Make the questions basic and suitable for beginners. Use simple vocabulary and straightforward concepts.";
      case "medium":
        return "Make the questions moderately challenging with some complexity. Require basic to intermediate knowledge.";
      case "hard":
        return "Make the questions challenging and complex. Include advanced concepts, detailed knowledge, and nuanced understanding.";
      default:
        return "Make the questions basic and suitable for beginners.";
    }
  };

  const difficultyInstructions = getDifficultyInstructions(difficulty);

  const prompt = `
    Generate ${questionCount} multiple choice questions about the topic "${topic}".
    
    Difficulty Level: ${difficulty.toUpperCase()}
    ${difficultyInstructions}
    
    Requirements:
    - Each question should have exactly 4 options
    - Only one option should be correct
    - Make sure the incorrect options are plausible but clearly wrong
    - Questions should be appropriate for ${difficulty} difficulty level
    - Cover different aspects of the topic if possible
    - Just make a quiz of what you understand after prompt is over dont cross question
    - If the topic is like too invalid no need to make a quiz for that
    
    Return only JSON in this exact format:
    [
      {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "answer": "..."
      }
    ]
    
    Important: The "answer" field must contain the exact text of the correct option from the "options" array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{role: "user", parts: [{text: prompt}]}]
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Find JSON in the response
    const jsonStart = text.indexOf("[");
    const jsonEnd = text.lastIndexOf("]");

    if (jsonStart === -1 || jsonEnd === -1) {
      throw new Error("No valid JSON found in response");
    }

    const quiz = JSON.parse(text.slice(jsonStart, jsonEnd + 1));

    // Validate the quiz structure
    if (!Array.isArray(quiz) || quiz.length !== questionCount) {
      throw new Error("Invalid quiz structure");
    }

    // Validate each question
    for (let i = 0; i < quiz.length; i++) {
      const q = quiz[i];
      if (
        !q.question ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        !q.answer
      ) {
        throw new Error(`Question ${i + 1} has invalid structure`);
      }

      // Ensure the answer is one of the options
      if (!q.options.includes(q.answer)) {
        throw new Error(`Question ${i + 1} answer is not in options`);
      }
    }

    res.json(quiz);
  } catch (err) {
    console.error("GenAI Error:", err);
    res.status(500).json({error: "Failed to generate Quiz. Please try again."});
  }
});

// Start server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
