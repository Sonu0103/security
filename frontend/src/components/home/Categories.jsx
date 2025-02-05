import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI, handleApiError } from "../../api/apis";
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

function Categories() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAllProducts();
      setProducts(data.products);
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Group products by category
  const productsByCategory = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  // Add a helper function to convert category names to URL-friendly format
  const getUrlFriendlyCategory = (category) => {
    return category.toLowerCase().replace(/\s+/g, "-");
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <section id="categories" className="py-16 bg-neutral-lightGray">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-neutral-darkGray mb-12 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(productsByCategory).map(([category, products]) => (
            <div
              key={category}
              className="bg-neutral-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
              onClick={() =>
                navigate(
                  `/products/category/${getUrlFriendlyCategory(category)}`
                )
              }
            >
              <img
                src={
                  getFullImageUrl(products[0]?.image) || "/default-category.jpg"
                }
                alt={category}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  if (!e.target.getAttribute("data-error-handled")) {
                    e.target.setAttribute("data-error-handled", "true");
                    e.target.src = "/default-category.jpg";
                    console.error("Image load error:", products[0]?.image);
                  }
                }}
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-neutral-darkGray mb-2">
                  {category}
                </h3>
                <p className="text-gray-600 mb-4">
                  {products.length} Products Available
                </p>
                <button className="w-full bg-primary-blue text-white py-2 rounded hover:bg-blue-600 transition-colors">
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
