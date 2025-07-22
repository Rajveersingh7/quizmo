// History.jsx - Shows user's quiz history and allows clearing/deleting
import React, {useEffect, useState} from "react";
import axios from "axios";
import {useNotifications} from "./Notification";
import {Trash} from "lucide-react";

const History = () => {
  const {showError, showSuccess} = useNotifications();
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Use environment variable for API URL
  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch quiz history from backend
  const fetchHistory = async () => {
    setFetching(true);
    try {
      const res = await axios.get(`${API_URL}/api/history`);
      setHistory(res.data.data);
    } catch (err) {
      showError("Failed to fetch quiz history.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line
  }, []);

  // Clear all quiz history
  const handleClearHistory = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your entire quiz history? This action cannot be undone."
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      await axios.delete(`${API_URL}/api/history`);
      showSuccess("All quiz history cleared.");
      setHistory([]);
    } catch (err) {
      showError("Failed to clear quiz history.");
    } finally {
      setClearing(false);
    }
  };

  // Delete a single quiz history entry
  const handleDeleteEntry = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`${API_URL}/api/history/${id}`);
      showSuccess("Quiz history entry deleted.");
      setHistory((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      showError("Failed to delete quiz history entry.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-20 sm:mt-12 px-4 mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-3xl font-bold text-primary">Quiz History</h2>
        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="btn btn-outline btn-error btn-sm"
            disabled={clearing}
          >
            {clearing ? "Clearing..." : "Clear History"}
          </button>
        )}
      </div>
      {history.length > 0 && (
        <div className="mb-3 mt-5 ml-1 text-sm text-gray-500 italic">
          Only history of your last 10 quizzes is saved.
        </div>
      )}
      {fetching ? (
        <div className="text-center text-lg">Loading...</div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500">No quiz history found.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((item) => (
            <div
              key={item._id}
              className="bg-white shadow-md rounded-lg p-5 border-l-4 border-primary flex flex-row items-center gap-2 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex-1 flex flex-col">
                <div className="font-semibold text-lg text-primary mb-1">
                  {item.topic.charAt(0).toUpperCase() + item.topic.slice(1)}
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Difficulty:{" "}
                  <span className="capitalize">{item.difficulty}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">
                  Score: <span className="font-bold">{item.score}</span> /{" "}
                  {item.totalQuestions} ({item.percentage}%)
                </div>
                <div className="text-xs text-gray-400 mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => handleDeleteEntry(item._id)}
                className="btn btn-outline btn-error btn-xs ml-2 self-end flex items-center justify-center"
                disabled={deletingId === item._id}
                title="Delete"
              >
                {deletingId === item._id ? (
                  "..."
                ) : (
                  <Trash className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
