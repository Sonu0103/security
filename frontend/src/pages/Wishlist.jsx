import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

function Wishlist() {
  const [favorites, setFavorites] = useState([]);
  const navigate = useNavigate();

  // This is a mock implementation. In a real app, you'd fetch from an API or localStorage
  const mockFavorites = [
    {
      id: "bats",
      name: "Premium Cricket Bat",
      price: 199.99,
      image: "/images/hero1.jpg",
      isFavorite: true,
    },
    {
      id: "balls",
      name: "Professional Cricket Ball",
      price: 29.99,
      image: "/images/hero2.jpg",
      isFavorite: true,
    },
  ];

  useEffect(() => {
    // Simulate fetching favorites
    setFavorites(mockFavorites);
  }, []);

  const removeFavorite = (productId) => {
    setFavorites(favorites.filter((product) => product.id !== productId));
  };

  if (favorites.length === 0) {
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
            className="bg-primary-blue text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
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
        {favorites.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-64 object-cover cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              />
              <button
                onClick={() => removeFavorite(product.id)}
                className="absolute top-2 right-2 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <HeartSolid className="h-6 w-6 text-highlight-red" />
              </button>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-neutral-darkGray mb-2">
                {product.name}
              </h3>
              <p className="text-primary-green text-xl font-bold mb-4">
                ${product.price}
              </p>
              <button className="w-full bg-accent-yellow text-neutral-darkGray py-2 rounded hover:bg-accent-orange transition-colors font-semibold">
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wishlist;
