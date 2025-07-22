// Signup.jsx - Signup page for new user registration
import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {useNotifications} from "../pages/Notification";
import {Eye, EyeOff, Loader2, CheckCircle, XCircle} from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const {register} = useAuth();
  const {showSuccess, showError} = useNotifications();

  // State for form data, errors, loading, and password visibility
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength checker
  const getPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 6,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    return {checks, score};
  };

  const passwordStrength = getPasswordStrength(formData.password);

  // Client-side validation for signup form
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (formData.username.length > 30) {
      newErrors.username = "Username must be less than 30 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (passwordStrength.score < 4) {
      newErrors.password =
        "Password must contain uppercase, lowercase, number and be 6+ characters";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

  // Handle form submission and registration logic
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await register(
        formData.username,
        formData.email,
        formData.password
      );
      showSuccess("Account created successfully! Welcome to Quizmo.");
      navigate("/");
    } catch (error) {
      console.error("Registration error:", error);

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
          case "USER_EXISTS":
            showError(errorMessage);
            if (errorMessage.includes("email")) {
              setErrors({email: "This email is already registered"});
            } else if (errorMessage.includes("username")) {
              setErrors({username: "This username is already taken"});
            }
            break;
          case "REGISTRATION_FAILED":
            showError("Registration failed. Please try again later.");
            break;
          default:
            showError(errorMessage || "An error occurred during registration.");
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
            <div className="font-bold text-2xl mb-6 text-center">Sign Up</div>

            {/* Username Field */}
            <div className="form-control w-full mb-4">
              <label className="label">
                <span className="label-text">Username</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.username ? "input-error" : ""
                }`}
                placeholder="Choose a username"
                disabled={isLoading}
              />
              {errors.username && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.username}
                  </span>
                </label>
              )}
            </div>

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
            <div className="form-control w-full mb-4">
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
                  placeholder="Create a password"
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

              {/* Password Strength Indicators */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {["length", "lowercase", "uppercase", "number"].map(
                      (check) => (
                        <div
                          key={check}
                          className={`h-1 flex-1 rounded ${
                            passwordStrength.checks[check]
                              ? "bg-success"
                              : "bg-base-300"
                          }`}
                        />
                      )
                    )}
                  </div>
                  <div className="text-xs text-base-content/70 space-y-1">
                    {Object.entries({
                      length: "6+ characters",
                      lowercase: "Lowercase letter",
                      uppercase: "Uppercase letter",
                      number: "Number"
                    }).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-1">
                        {passwordStrength.checks[key] ? (
                          <CheckCircle className="w-3 h-3 text-success" />
                        ) : (
                          <XCircle className="w-3 h-3 text-base-content/30" />
                        )}
                        <span
                          className={
                            passwordStrength.checks[key] ? "text-success" : ""
                          }
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.password && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.password}
                  </span>
                </label>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-control w-full mb-6">
              <label className="label">
                <span className="label-text">Confirm Password</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input input-bordered w-full pr-12 ${
                    errors.confirmPassword
                      ? "input-error"
                      : formData.confirmPassword &&
                        formData.password === formData.confirmPassword
                      ? "input-success"
                      : ""
                  }`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-base-content/50" />
                  ) : (
                    <Eye className="h-4 w-4 text-base-content/50" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <label className="label">
                  <span className="label-text-alt text-error">
                    {errors.confirmPassword}
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
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </button>

            {/* Link to Login */}
            <div className="pt-4 text-gray-400 text-center">
              Already have an account?{" "}
              <Link to="/login" className="underline hover:text-primary">
                Login
              </Link>
            </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
};

export default Signup;
