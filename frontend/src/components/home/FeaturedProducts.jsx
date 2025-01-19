import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { productAPI, handleApiError } from "../../api/apis";
import { useFavorites } from "../../context/FavoritesContext";
import toast from "react-hot-toast";

function FeaturedProducts() {
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const { data } = await productAPI.getFeaturedProducts();
      console.log("Featured products:", data); // For debugging
      setProducts(data.products);
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteClick = (e, product) => {
    e.stopPropagation();
    if (isFavorite(product._id)) {
      removeFromFavorites(product._id);
    } else {
      addToFavorites(product);
    }
  };

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">Loading...</div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null; // Don't show the section if there are no featured products
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-neutral-darkGray mb-12 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() =>
                navigate(`/product/${product.category.toLowerCase()}`)
              }
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={(e) => handleFavoriteClick(e, product)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                >
                  {isFavorite(product._id) ? (
                    <HeartSolid className="h-5 w-5 text-highlight-red" />
                  ) : (
                    <HeartOutline className="h-5 w-5" />
                  )}
                </button>
                <span className="absolute top-2 left-2 bg-highlight-gold text-white px-3 py-1 rounded-full text-sm">
                  Featured
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-neutral-darkGray mb-2">
                  {product.name}
                </h3>
                <p className="text-primary-green text-xl font-bold mb-4">
                  ${product.price}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // Add to cart logic here
                    toast.success("Added to cart");
                  }}
                  className="w-full bg-accent-yellow text-neutral-darkGray py-2 rounded hover:bg-accent-orange transition-colors font-semibold"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;
