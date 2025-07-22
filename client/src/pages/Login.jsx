// Login.jsx - Login page for user authentication
import {useState, useEffect} from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {useNotifications} from "../pages/Notification";
import {Eye, EyeOff, Loader2} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {login} = useAuth();
  const {showSuccess, showError, clearNotifications} = useNotifications();

  useEffect(() => {
    if (location.state?.showHistoryError) {
      clearNotifications();
      showError("Please login first to check history.");
      navigate(location.pathname, {replace: true, state: {}});
    } else {
      clearNotifications();
    }
    // eslint-disable-next-line
  }, []); // Only run on mount

  // State for form data, errors, loading, and password visibility
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Client-side validation for login form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes and clear errors
  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Handle form submission and login logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await login(formData.email, formData.password);
      showSuccess("Welcome back! Login successful.");
      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      // Handle different types of errors
      if (error.response?.data?.error) {
        const errorCode = error.response.data.error;
        const errorMessage = error.response.data.message;

        switch (errorCode) {
          case "VALIDATION_ERROR":
            // Handle validation errors from server
            const validationErrors = {};
            error.response.data.details?.forEach((detail) => {
              validationErrors[detail.path] = detail.msg;
            });
            setErrors(validationErrors);
            showError("Please check your input and try again.");
            break;
          case "INVALID_CREDENTIALS":
            showError("Invalid email or password. Please try again.");
            break;
          case "LOGIN_FAILED":
            showError("Login failed. Please try again later.");
            break;
          default:
            showError(errorMessage || "An error occurred during login.");
        }
      } else if (error.response?.status === 500) {
        showError("Server error. Please try again later.");
      } else if (error.code === "NETWORK_ERROR") {
        showError("Network error. Please check your connection.");
      } else {
        showError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Main render
  return (
    <div className="h-[calc(100vh-7rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box border p-6">
            <div className="font-bold text-2xl mb-6 text-center">Login</div>

            {/* Email Field */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.email ? "input-error" : ""
                }`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.email}
                  </span>
                </label>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">Password</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`input input-bordered w-full pr-12 ${
                    errors.password ? "input-error" : ""
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-base-content/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-base-content/50" />
                  )}
                </button>
              </div>
              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password}
                  </span>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn bg-[#605dff] text-[#edf1fe] hover:bg-[#4f4ae6] w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Login"
              )}
            </button>

            {/* Link to Signup */}
            <div className="pt-4 text-gray-400 text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="underline hover:text-primary">
                Sign up
              </Link>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default Login;
