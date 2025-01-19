import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const { confirmPassword, ...registerData } = formData;
        const { data } = await authAPI.register(registerData);

        // Show success message
        toast.success("Account created successfully! Please login.");

        // Redirect to login page instead of home
        navigate("/login", {
          state: {
            email: formData.email,
            message:
              "Registration successful! Please login with your credentials.",
          },
        });
      } catch (error) {
        const { message } = handleApiError(error);
        toast.error(message);
        setErrors((prev) => ({
          ...prev,
          submit: message,
        }));
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
            Create Account
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.name
                    ? "border-highlight-red ring-highlight-red/50"
                    : "focus:ring-primary-blue/50"
                }`}
                placeholder="Enter your full name"
              />
              {errors.name && (
                <p className="text-highlight-red text-sm mt-1">{errors.name}</p>
              )}
            </div>

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

            <div>
              <label className="block text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.phone
                    ? "border-highlight-red ring-highlight-red/50"
                    : "focus:ring-primary-blue/50"
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phone && (
                <p className="text-highlight-red text-sm mt-1">
                  {errors.phone}
                </p>
              )}
            </div>

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
                placeholder="Create a password"
              />
              {errors.password && (
                <p className="text-highlight-red text-sm mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? "border-highlight-red ring-highlight-red/50"
                    : "focus:ring-primary-blue/50"
                }`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && (
                <p className="text-highlight-red text-sm mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.submit && (
              <p className="text-highlight-red text-sm text-center">
                {errors.submit}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 text-white rounded-lg ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary-blue hover:bg-blue-600"
              } transition-colors`}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary-blue hover:underline font-medium"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
