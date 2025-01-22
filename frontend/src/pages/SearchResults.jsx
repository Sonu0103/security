import React, { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import LoadingOverlay from "../components/common/LoadingOverlay";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { HeartIcon, ShoppingCartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { checkAuth } from "../utils/auth";

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("query");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const { isAuthenticated } = checkAuth();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Fetching search results for query:", query);
        const response = await axios.get(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/api/products/search?query=${encodeURIComponent(query)}`
        );
        console.log("Search API response:", response);

        const { data } = response;

        if (data && data.success) {
          setProducts(data.products || []);
          if (data.products.length === 0) {
            toast.info("No products found matching your search.");
          }
        } else {
          console.error("API Error:", data);
          setError(data?.message || "Failed to fetch search results");
          toast.error(data?.message || "Failed to fetch search results");
        }
      } catch (error) {
        console.error("Search error details:", error.response || error);
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch search results. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, navigate]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      navigate("/login");
      return;
    }

    try {
      await addToCart(product);
      toast.success("Added to cart successfully!");
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleFavoriteToggle = async (product) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to wishlist");
      navigate("/login");
      return;
    }

    try {
      const isFavorite = favorites.some((fav) => fav._id === product._id);
      if (isFavorite) {
        await removeFromFavorites(product._id);
        toast.success("Removed from wishlist!");
      } else {
        await addToFavorites(product);
        toast.success("Added to wishlist!");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      toast.error("Failed to update wishlist. Please try again.");
    }
  };

  if (!query) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingOverlay />
      </div>
    );
  }

  return (
    <section className="py-16 bg-neutral-lightGray">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-neutral-darkGray">
            Search Results for "{query}"
          </h1>
          <Link to="/" className="text-primary-blue hover:underline">
            Back to Home
          </Link>
        </div>

        {error ? (
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Link to="/" className="text-primary-blue hover:underline">
              Return to Home
            </Link>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              No products found for "{query}"
            </p>
            <Link to="/" className="text-primary-blue hover:underline">
              Return to Home
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => {
              const isFavorite = favorites.some(
                (fav) => fav._id === product._id
              );
              return (
                <div
                  key={product._id}
                  className="bg-neutral-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <Link to={`/product/${product._id}`}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  </Link>
                  <div className="p-4">
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-xl font-semibold text-neutral-darkGray mb-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-gray-600 mb-2">{product.category}</p>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xl font-bold text-green-600">
                        ${product.price}
                      </p>
                      <p className="text-sm text-gray-500">
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`flex-1 mr-2 flex items-center justify-center px-4 py-2 rounded ${
                          product.stock === 0
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-primary-blue text-white hover:bg-blue-600"
                        }`}
                      >
                        <ShoppingCartIcon className="h-5 w-5 mr-2" />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => handleFavoriteToggle(product)}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        {isFavorite ? (
                          <HeartIconSolid className="h-6 w-6 text-red-500" />
                        ) : (
                          <HeartIcon className="h-6 w-6 text-gray-400 hover:text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default SearchResults;
