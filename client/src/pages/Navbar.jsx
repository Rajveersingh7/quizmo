// Navbar.jsx - Top navigation bar for the app
import {Link} from "react-router-dom";
import {History, Home} from "lucide-react";
import {useAuth} from "../contexts/AuthContext";
import {useNotifications} from "./Notification";

const Navbar = () => {
  const {user, logout} = useAuth();
  const {showSuccess} = useNotifications();
  return (
    <div className="navbar bg-primary text-primary-content shadow-lg border-b border-primary/20 sticky top-0 z-40">
      <div className="flex-1 flex">
        <div className="flex items-center ml-4">
          {/* Home Icon */}
          <Link
            to="/"
            className="cursor-pointer flex items-center justify-center w-10 h-10"
          >
            <Home className="w-10 h-10 text-white" strokeWidth={2} />
          </Link>
        </div>
      </div>
      <div className="navbar-end mr-2">
        {!user ? (
          <>
            <Link
              to="/login"
              className="btn btn-primary bg-gray-200 text-[#605dff] rounded-4xl mr-2 text-[14px] hover:bg-white transition-colors duration-300"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="btn btn-primary bg-gray-200 text-[#605dff] rounded-4xl mr-2 text-[14px] hover:bg-white transition-colors duration-300"
            >
              Signup
            </Link>
          </>
        ) : (
          <button
            onClick={() => {
              logout();
              showSuccess("Logged out successfully");
            }}
            className="btn btn-primary bg-gray-200 text-[#605dff] rounded-4xl mr-2 text-[14px] hover:bg-white transition-colors duration-300"
          >
            Logout
          </button>
        )}
        <Link
          to="/history"
          className="btn btn-primary btn-circle bg-gray-200 flex items-center gap-2 hover:bg-white transition-colors duration-300"
        >
          <History color="#605dff" className="text-primary-content w-7 h-7" />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
