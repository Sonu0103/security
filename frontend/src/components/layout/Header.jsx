import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  HeartIcon,
  ShoppingCartIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { useFavorites } from "../../context/FavoritesContext";
import toast from "react-hot-toast";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  // Check auth status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!token || !storedUser) {
        setUser(null);
        return;
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    // Check initial auth status
    checkAuth();

    // Listen for storage changes
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavigation = (target) => {
    if (location.pathname === "/") {
      // If we're on home page, scroll to sections
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      navigate("/");
      setTimeout(() => {
        const element = document.querySelector(target);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Update state
    setUser(null);
    setIsDropdownOpen(false);

    // Show success message
    toast.success("Logged out successfully");

    // Navigate to home
    navigate("/");
  };

  return (
    <header className="bg-white shadow sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavigation("#hero")}
            className="flex items-center focus:outline-none"
          >
            <img
              src="/images/logo.png"
              alt="Cricket Store"
              className="h-12 w-auto"
            />
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNavigation("#hero")}
              className="text-neutral-darkGray hover:text-primary-blue font-medium transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavigation("#categories")}
              className="text-neutral-darkGray hover:text-primary-blue font-medium transition-colors"
            >
              Shop
            </button>
            <button
              onClick={() => handleNavigation("#footer")}
              className="text-neutral-darkGray hover:text-primary-blue font-medium transition-colors"
            >
              About Us
            </button>
          </nav>

          {/* Auth/Profile Section */}
          <div className="flex items-center space-x-4">
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="text-neutral-darkGray hover:text-primary-blue transition-colors relative"
            >
              <HeartIcon className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-highlight-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {favorites.length}
              </span>
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="text-neutral-darkGray hover:text-primary-blue transition-colors relative"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <span className="absolute -top-2 -right-2 bg-highlight-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {user ? (
              // Profile Dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-blue focus:outline-none"
                >
                  {user.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span>{user.name}</span>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <UserIcon className="h-5 w-5 mr-2" />
                      Profile
                    </Link>
                    {user.role === "admin" && (
                      <Link
                        to="/admin/products"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        <Cog6ToothIcon className="h-5 w-5 mr-2" />
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login/Signup Buttons
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-primary-blue hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
