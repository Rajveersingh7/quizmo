// Quiz.jsx - Main quiz page for generating and taking quizzes
import {useState, useRef} from "react";
import axios from "axios";
import {
  Send,
  CheckCircle,
  XCircle,
  Trophy,
  Brain,
  ChevronDown
} from "lucide-react";
import {useNotifications} from "./Notification";

const Quiz = () => {
  // State variables to manage the quiz
  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // New filter states for difficulty and question count
  const [difficulty, setDifficulty] = useState("easy");
  const [questionCount, setQuestionCount] = useState(3);

  const {showError} = useNotifications();

  // Use environment variable for API URL
  const API_URL = import.meta.env.VITE_API_URL;

  // Function to generate quiz from backend
  const handleGenerate = async () => {
    if (!topic.trim()) {
      showError("Please enter a topic!");
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/generate`, {
        topic,
        difficulty,
        questionCount
      });
      setQuestions(res.data);
      setAnswers({});
      setCurrentQuestionIndex(0);
      setScore(null);
      setIsQuizStarted(true);
      setShowResults(false);
    } catch (error) {
      console.error("Error generating quiz:", error);
      showError("Failed to generate quiz. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle option selection for current question
  const handleOptionChange = (option) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: option
    });
  };

  // Ref for question card (used for scrolling)
  const questionCardRef = useRef(null);

  // Function to go to next question and scroll to top
  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => {
        setTimeout(() => {
          if (questionCardRef.current) {
            questionCardRef.current.scrollTop = 0;
            questionCardRef.current.scrollIntoView({
              behavior: "auto",
              block: "nearest"
            });
          }
        }, 0);
        return prev + 1;
      });
    }
  };

  // Function to submit quiz and calculate score
  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) {
        correct++;
      }
    });
    setScore(correct);
    setShowResults(true);

    // Save quiz history to backend
    try {
      await axios.post(`${API_URL}/api/history`, {
        topic,
        difficulty,
        questionCount: questions.length,
        score: correct,
        totalQuestions: questions.length
      });
    } catch (error) {
      console.error("Failed to save quiz history:", error);
      // Optionally show a notification here
    }
  };

  // Function to start new quiz (reset state)
  const handleStartNewQuiz = () => {
    setTopic("");
    setQuestions([]);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setScore(null);
    setIsQuizStarted(false);
    setShowResults(false);
  };

  // Get current question and check if last question
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasSelectedAnswer = answers[currentQuestionIndex] !== undefined;

  // Helper function to get score message based on performance
  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "Perfect Score! 🎉";
    if (percentage >= 70) return "Great Job! 👏";
    if (percentage >= 50) return "Good Effort! 💪";
    return "Keep Learning! 📚";
  };

  return (
    <div
      className="flex flex-col bg-base-100"
      style={{height: "calc(100vh - 64px)"}}
    >
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto h-full flex flex-col justify-center">
            {/* Welcome State */}
            {!isQuizStarted && !isLoading && (
              <div className="text-center">
                <div className="mb-8 flex flex-col items-center">
                  <div className="w-20 h-20 bg-base-100 rounded-full flex items-center justify-center mb-2 border-4 border-primary">
                    <Brain className="text-primary w-12 h-12" />
                  </div>
                  <h1 className="text-5xl font-bold text-primary mb-4">
                    Welcome to Quizmo
                  </h1>
                  <p className="text-xl text-base-content/70">
                    Enter a topic below to start your AI-powered quiz
                  </p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center">
                <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
                <p className="text-xl text-base-content/70">
                  Generating your {difficulty} quiz with {questionCount}{" "}
                  questions...
                </p>
              </div>
            )}

            {/* Quiz Question */}
            {isQuizStarted && !showResults && currentQuestion && (
              <div className="max-w-3xl mx-auto w-full">
                {/* Progress */}
                <div
                  className="mb-8 sticky top-0 z-20 bg-base-100 pt-2 pb-2"
                  style={{background: "inherit"}}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-lg font-medium">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge capitalize px-3 py-2 text-base font-semibold bg-transparent ${
                          difficulty === "easy"
                            ? "border-green-500 text-green-600"
                            : difficulty === "medium"
                            ? "border-yellow-500 text-yellow-700"
                            : "border-red-500 text-red-600"
                        }`}
                        style={{borderWidth: "2px"}}
                      >
                        {difficulty}
                      </span>
                      <span className="text-base-content/70">
                        {Math.round(
                          ((currentQuestionIndex + 1) / questions.length) * 100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                  <progress
                    className="progress progress-primary w-full h-3"
                    value={currentQuestionIndex + 1}
                    max={questions.length}
                  ></progress>
                </div>

                {/* Question Card */}
                <div
                  ref={questionCardRef}
                  className="bg-base-200 rounded-2xl p-8 shadow-lg max-h-[340px] overflow-y-auto"
                >
                  <h2 className="text-2xl font-bold mb-8 text-center">
                    {currentQuestion.question}
                  </h2>

                  {/* Options */}
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, index) => (
                      <label
                        key={index}
                        className={`flex items-center space-x-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-base-300 ${
                          answers[currentQuestionIndex] === option
                            ? "bg-primary/20 border-2 border-primary"
                            : "bg-base-100 border-2 border-transparent"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          className="radio radio-primary"
                          checked={answers[currentQuestionIndex] === option}
                          onChange={() => handleOptionChange(option)}
                        />
                        <span className="text-lg flex-1">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            {showResults && (
              <div className="max-w-6xl mx-auto w-full">
                <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-8 shadow-xl">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <Trophy className="w-16 h-16 text-primary mx-auto mb-3" />
                    <h2 className="text-3xl font-bold mb-4">Quiz Complete!</h2>
                    <div className="bg-base-100 rounded-2xl p-6 inline-block">
                      <div className="text-4xl font-bold text-primary mb-1">
                        {score}/{questions.length}
                      </div>
                      <div className="text-lg text-base-content/70 mb-2">
                        {getScoreMessage()}
                      </div>
                      <div className="flex justify-center gap-2">
                        <span
                          className={`badge capitalize px-3 py-2 text-base font-semibold bg-transparent ${
                            difficulty === "easy"
                              ? "border-green-500 text-green-600"
                              : difficulty === "medium"
                              ? "border-yellow-500 text-yellow-700"
                              : "border-red-500 text-red-600"
                          }`}
                          style={{borderWidth: "2px"}}
                        >
                          {difficulty}
                        </span>
                        <span className="badge badge-outline">
                          {questions.length} questions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Results - Grid Layout */}
                  <div
                    className={`grid gap-4 mb-6 overflow-y-auto max-h-[200px] ${
                      questions.length <= 3
                        ? "grid-cols-1 md:grid-cols-3"
                        : questions.length <= 5
                        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                  >
                    {questions.map((q, index) => (
                      <div key={index} className="bg-base-100 rounded-xl p-4">
                        <div className="flex items-start space-x-3">
                          {answers[index] === q.answer ? (
                            <CheckCircle className="w-5 h-5 text-success mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-error mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium mb-2 text-sm leading-tight">
                              {q.question}
                            </p>
                            <p className="text-xs text-base-content/70 mb-1">
                              Your answer:{" "}
                              <span
                                className={
                                  answers[index] === q.answer
                                    ? "text-success font-medium"
                                    : "text-error font-medium"
                                }
                              >
                                {answers[index] || "Not answered"}
                              </span>
                            </p>
                            {answers[index] !== q.answer && (
                              <p className="text-xs text-success font-medium">
                                Correct: {q.answer}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <button
                      onClick={handleStartNewQuiz}
                      className="btn btn-primary btn-lg"
                    >
                      Take Another Quiz
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Button - Only show during quiz */}
        {isQuizStarted && !showResults && (
          <div className="p-6 bg-base-100 flex justify-center sticky bottom-0 z-30">
            <div className="max-w-3xl w-full flex justify-end">
              {isLastQuestion ? (
                <button
                  onClick={handleSubmit}
                  disabled={!hasSelectedAnswer}
                  className="btn btn-success btn-lg"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!hasSelectedAnswer}
                  className="btn btn-primary btn-lg"
                >
                  Next Question
                </button>
              )}
            </div>
          </div>
        )}

        {/* Bottom Input Area with Filters - Only show when not in quiz */}
        {!isQuizStarted && !isLoading && (
          <div className="p-6 bg-base-100">
            <div className="max-w-4xl mx-auto">
              {/* Topic Input with Dropdowns */}
              <div className="flex w-full gap-2 items-stretch flex-col sm:flex-row">
                {/* Dropdown Boxes */}
                <div className="flex gap-2 w-full sm:w-auto">
                  {/* Difficulty Dropdown */}
                  <div className="dropdown dropdown-top w-full sm:w-auto">
                    <div
                      tabIndex={0}
                      role="button"
                      className="input input-bordered h-11 min-h-0 px-3 flex items-center gap-2 cursor-pointer hover:border-primary/30 transition-colors text-sm w-full sm:w-[140px]"
                    >
                      <span className="text-sm text-base-content/70">
                        Difficulty:
                      </span>
                      <span className="font-medium capitalize text-base-content">
                        {difficulty}
                      </span>
                      <ChevronDown className="w-4 h-4 text-base-content/50 ml-auto" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-100 rounded-box z-[1] w-40 p-2 shadow-lg border mb-2"
                    >
                      <li>
                        <a
                          onClick={() => setDifficulty("easy")}
                          className={`flex items-center justify-between ${
                            difficulty === "easy"
                              ? "bg-primary/20 text-primary"
                              : ""
                          }`}
                        >
                          Easy
                          {difficulty === "easy" && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setDifficulty("medium")}
                          className={`flex items-center justify-between ${
                            difficulty === "medium"
                              ? "bg-primary/20 text-primary"
                              : ""
                          }`}
                        >
                          Medium
                          {difficulty === "medium" && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setDifficulty("hard")}
                          className={`flex items-center justify-between ${
                            difficulty === "hard"
                              ? "bg-primary/20 text-primary"
                              : ""
                          }`}
                        >
                          Hard
                          {difficulty === "hard" && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </a>
                      </li>
                    </ul>
                  </div>

                  {/* Questions Dropdown */}
                  <div className="dropdown dropdown-top w-full sm:w-auto">
                    <div
                      tabIndex={0}
                      role="button"
                      className="input input-bordered h-11 min-h-0 px-3 flex items-center gap-2 cursor-pointer hover:border-primary/30 transition-colors text-sm w-full sm:w-[120px]"
                    >
                      <span className="text-sm text-base-content/70">
                        Questions:
                      </span>
                      <span className="font-medium text-base-content">
                        {questionCount}
                      </span>
                      <ChevronDown className="w-4 h-4 text-base-content/50 ml-auto" />
                    </div>
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu bg-base-100 rounded-box z-[1] w-32 p-2 shadow-lg border mb-2"
                    >
                      <li>
                        <a
                          onClick={() => setQuestionCount(3)}
                          className={`flex items-center justify-between ${
                            questionCount === 3
                              ? "bg-primary/20 text-primary"
                              : ""
                          }`}
                        >
                          3
                          {questionCount === 3 && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setQuestionCount(5)}
                          className={`flex items-center justify-between ${
                            questionCount === 5
                              ? "bg-primary/20 text-primary"
                              : ""
                          }`}
                        >
                          5
                          {questionCount === 5 && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => setQuestionCount(7)}
                          className={`flex items-center justify-between ${
                            questionCount === 7
                              ? "bg-primary/20 text-primary"
                              : ""
                          }`}
                        >
                          7
                          {questionCount === 7 && (
                            <CheckCircle className="w-4 h-4 text-success" />
                          )}
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Topic Input and Send Button */}
                <div className="flex w-full gap-2 mt-2 sm:mt-0">
                  <textarea
                    className="textarea textarea-bordered flex-1 resize-none h-11 min-h-0 max-h-28 focus:outline-none focus:border-primary/50 text-sm w-full"
                    placeholder="Enter any topic (e.g., Space, History, Animals, etc.)"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    rows="1"
                    style={{height: "44px"}}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !topic.trim()}
                    className="btn btn-primary flex items-center h-11 min-h-0 px-4 w-14 sm:w-auto"
                    style={{height: "44px"}}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
