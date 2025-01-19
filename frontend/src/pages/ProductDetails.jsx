import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { productAPI, handleApiError } from "../api/apis";
import { useFavorites } from "../context/FavoritesContext";
import toast from "react-hot-toast";

function ProductDetails() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const [currentImage, setCurrentImage] = useState(0);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getProductsByCategory(category);
      setProducts(data.products);

      // Set the first product as selected if available
      if (data.products.length > 0) {
        setSelectedProduct(data.products[0]);
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (productId) => {
    if (isFavorite(productId)) {
      removeFromFavorites(productId);
    } else {
      const product = products.find((p) => p._id === productId);
      if (product) {
        addToFavorites(product);
      }
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!selectedProduct) {
    return <div>Product not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <div className="relative">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            <button
              onClick={() => toggleFavorite(selectedProduct._id)}
              className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            >
              {isFavorite(selectedProduct._id) ? (
                <HeartSolid className="h-6 w-6 text-highlight-red" />
              ) : (
                <HeartOutline className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-darkGray mb-4">
            {selectedProduct.name}
          </h1>
          <p className="text-2xl text-primary-green font-bold mb-6">
            ${selectedProduct.price}
          </p>
          <div className="prose max-w-none mb-6">
            <p className="text-gray-600">{selectedProduct.description}</p>
          </div>
          <div className="mb-6">
            <p className="text-gray-600">
              Stock: {selectedProduct.stock} available
            </p>
          </div>
          <button className="w-full bg-accent-yellow text-neutral-darkGray py-3 rounded-lg hover:bg-accent-orange transition-colors font-semibold">
            Add to Cart
          </button>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-darkGray mb-6">
          Related Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products
            .filter((p) => p._id !== selectedProduct._id)
            .slice(0, 4)
            .map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                  {isFavorite(product._id) && (
                    <HeartSolid className="absolute top-2 right-2 h-6 w-6 text-highlight-red" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-darkGray">
                    {product.name}
                  </h3>
                  <p className="text-primary-green font-bold mt-2">
                    ${product.price}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
