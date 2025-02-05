import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { ShoppingCartIcon, CheckIcon } from "@heroicons/react/24/outline";
import { productAPI, handleApiError } from "../api/apis";
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

function ProductDetails() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (category) {
      fetchProductsByCategory();
    }
  }, [category]);

  const fetchProductsByCategory = async () => {
    try {
      setIsLoading(true);
      const { data } = await productAPI.getProductsByCategory(category);
      if (!data || !data.products) {
        throw new Error("No products found");
      }
      setProducts(data.products);
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryDisplayName = (urlCategory) => {
    const categoryMap = {
      "protection-gear": "Protection Gear",
      "training-equipment": "Training Equipment",
      bats: "Bats",
      balls: "Balls",
      clothing: "Clothing",
      accessories: "Accessories",
    };
    return categoryMap[urlCategory?.toLowerCase()] || urlCategory;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-highlight-red">
          <p>{error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-darkGray mb-8">
        {getCategoryDisplayName(category)} Products
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={getFullImageUrl(product.image)}
                alt={product.name}
                className="w-full h-64 object-cover"
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
                onClick={(e) => {
                  e.stopPropagation();
                  if (isFavorite(product._id)) {
                    removeFromFavorites(product._id);
                  } else {
                    addToFavorites(product);
                  }
                }}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                {isFavorite(product._id) ? (
                  <HeartSolid className="h-6 w-6 text-highlight-red" />
                ) : (
                  <HeartOutline className="h-6 w-6" />
                )}
              </button>
            </div>
            <div className="p-6">
              <h3
                className="text-xl font-semibold text-neutral-darkGray mb-2 cursor-pointer hover:text-primary-blue"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <p className="text-2xl font-bold text-primary-green">
                  ${product.price}
                </p>
                <div className="flex items-center">
                  <div
                    className={`px-3 py-1 rounded-full text-sm ${
                      product.stock > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock > 0 ? (
                      <>
                        <CheckIcon className="inline-block h-4 w-4 mr-1" />
                        In Stock ({product.stock})
                      </>
                    ) : (
                      "Out of Stock"
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (product.stock > 0) {
                    addToCart(product._id);
                  } else {
                    toast.error("Product is out of stock");
                  }
                }}
                disabled={product.stock === 0}
                className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  product.stock > 0
                    ? "bg-primary-blue text-white hover:bg-blue-600"
                    : "bg-gray-200 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No products found in this category.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go Back Home
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;
