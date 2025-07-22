// History.js - Mongoose model for quiz history
// History model on basis of which the history will be stored in database
import mongoose from "mongoose";

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"]
    },
    questionCount: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    },
    totalQuestions: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    }
  },
  {timestamps: true}
);

const History = mongoose.model("History", historySchema);
export default History;
