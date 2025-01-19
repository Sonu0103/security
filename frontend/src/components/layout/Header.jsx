import { Link, useNavigate, useLocation } from "react-router-dom";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "../../context/FavoritesContext";

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { favorites } = useFavorites();

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

          {/* Action Buttons */}
          <div className="flex items-center space-x-6">
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

            {/* Sign Up Button */}
            <Link
              to="/signup"
              className="bg-primary-blue text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
