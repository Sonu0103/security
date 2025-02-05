import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "../context/FavoritesContext";
import { useCart } from "../context/CartContext";
import toast from "react-hot-toast";

// Add helper function for image URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/images/placeholder.png";
  if (imagePath.startsWith("data:") || imagePath.startsWith("blob:"))
    return imagePath;
  if (imagePath.startsWith("http")) {
    // Convert https to http if needed
    return imagePath.replace("https://localhost", "http://localhost");
  }
  return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
};

function Wishlist() {
  const navigate = useNavigate();
  const { favorites, removeFromFavorites, isLoading } = useFavorites();
  const { addToCart } = useCart();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view your wishlist");
      navigate("/login");
      return;
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!favorites || favorites.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-darkGray mb-4">
            Your Wishlist
          </h1>
          <p className="text-gray-600 mb-8">
            You haven't added any products to your wishlist yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-darkGray mb-8">
        Your Wishlist
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {favorites.map((product) => {
          // Skip rendering if product is null or invalid
          if (!product?._id) return null;

          return (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative">
                <img
                  src={getFullImageUrl(product.image)}
                  alt={product.name || "Product"}
                  className="w-full h-64 object-cover cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                  onError={(e) => {
                    if (!e.target.getAttribute("data-error-handled")) {
                      e.target.setAttribute("data-error-handled", "true");
                      e.target.src = "/images/placeholder.png";
                      console.error("Image load error:", product.image);
                    }
                  }}
                />
                <button
                  onClick={() => removeFromFavorites(product._id)}
                  className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  <HeartSolid className="h-6 w-6 text-highlight-red" />
                </button>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-darkGray mb-2">
                  {product.name || "Unnamed Product"}
                </h3>
                <p className="text-gray-600 mb-2 line-clamp-2">
                  {product.description || "No description available"}
                </p>
                <p className="text-primary-green text-xl font-bold mb-4">
                  ${(product.price || 0).toFixed(2)}
                </p>
                <button
                  onClick={() => {
                    if (!product.stock || product.stock <= 0) {
                      toast.error("Product is out of stock");
                      return;
                    }
                    addToCart(product._id);
                  }}
                  disabled={!product.stock || product.stock <= 0}
                  className={`w-full py-2 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                    !product.stock || product.stock <= 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-primary-blue text-white hover:bg-blue-600"
                  } transition-colors`}
                >
                  <ShoppingCartIcon className="h-5 w-5" />
                  {!product.stock || product.stock <= 0
                    ? "Out of Stock"
                    : "Add to Cart"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Wishlist;
