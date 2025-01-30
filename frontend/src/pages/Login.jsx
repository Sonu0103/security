import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // Initialize reCAPTCHA
  useEffect(() => {
    // Remove any existing reCAPTCHA scripts
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and add new reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        try {
          window.grecaptcha.render("recaptcha-container", {
            sitekey: import.meta.env.VITE_RECAPTCHA_SITE_KEY,
            callback: () => setRecaptchaLoaded(true),
          });
        } catch (error) {
          console.error("reCAPTCHA render error:", error);
        }
      });
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      document.head.removeChild(script);
      // Reset reCAPTCHA global variables
      window.grecaptcha = undefined;
    };
  }, []);

  // Show registration success message if redirected from signup
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state?.message]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Wait for reCAPTCHA to be ready
        if (!window.grecaptcha) {
          toast.error("Please wait for reCAPTCHA to load");
          return;
        }

        const recaptchaValue = window.grecaptcha.getResponse();
        if (!recaptchaValue) {
          toast.error("Please complete the reCAPTCHA verification");
          return;
        }

        setIsLoading(true);
        const { data } = await authAPI.login({
          ...formData,
          recaptchaToken: recaptchaValue,
        });

        // Reset reCAPTCHA
        window.grecaptcha.reset();

        // Show success message
        toast.success("Login successful!");

        // Redirect based on role
        if (data.user.role === "admin") {
          navigate("/admin/products");
        } else {
          navigate("/");
        }
      } catch (error) {
        const { message } = handleApiError(error);
        toast.error(message);
        setErrors((prev) => ({
          ...prev,
          submit: message,
        }));
        // Reset reCAPTCHA on error
        if (window.grecaptcha) {
          window.grecaptcha.reset();
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-neutral-darkGray mb-8 text-center">
            Welcome Back
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field */}
            <div>
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.email
                    ? "border-highlight-red ring-highlight-red/50"
                    : "focus:ring-primary-blue/50"
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-highlight-red text-sm mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.password
                    ? "border-highlight-red ring-highlight-red/50"
                    : "focus:ring-primary-blue/50"
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-highlight-red text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox text-primary-blue"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-blue hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* reCAPTCHA */}
            <div className="flex justify-center">
              <div id="recaptcha-container"></div>
            </div>

            {errors.submit && (
              <p className="text-highlight-red text-sm text-center">
                {errors.submit}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !recaptchaLoaded}
              className={`w-full py-3 px-4 text-white rounded-lg ${
                isLoading || !recaptchaLoaded
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-blue hover:bg-blue-600"
              } transition-colors`}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-primary-blue hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
