// App.jsx - Main entry point for React app, sets up routing and providers
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Navbar from "./pages/Navbar";
import Quiz from "./pages/Quiz";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import History from "./pages/History";
import {AuthProvider} from "./contexts/AuthContext";
import {NotificationProvider} from "./pages/Notification";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NotificationProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Quiz />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
          </Routes>
        </NotificationProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
