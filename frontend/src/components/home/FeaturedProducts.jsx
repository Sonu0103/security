import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const initialProducts = [
  {
    id: "bats",
    name: "Premium Cricket Bat",
    price: 199.99,
    image: "/images/hero1.jpg",
    badge: "Best Seller",
    isFavorite: false,
  },
  {
    id: "balls",
    name: "Professional Cricket Ball",
    price: 29.99,
    image: "/images/hero2.jpg",
    badge: "New",
    isFavorite: false,
  },
  {
    id: "kits",
    name: "Complete Cricket Kit",
    price: 299.99,
    image: "/images/hero3.jpg",
    badge: "Popular",
    isFavorite: false,
  },
  {
    id: "gloves",
    name: "Professional Gloves",
    price: 49.99,
    image: "/images/hero1.jpg",
    isFavorite: false,
  },
];

function FeaturedProducts() {
  const [products, setProducts] = useState(initialProducts);
  const navigate = useNavigate();

  const toggleFavorite = (productId, event) => {
    event.stopPropagation(); // Prevent navigation when clicking the heart
    setProducts(
      products.map((product) =>
        product.id === productId
          ? { ...product, isFavorite: !product.isFavorite }
          : product
      )
    );
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-neutral-darkGray mb-12 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-neutral-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {product.isFavorite ? (
                      <HeartSolid className="h-6 w-6 text-highlight-red" />
                    ) : (
                      <HeartOutline className="h-6 w-6 text-white hover:text-highlight-red" />
                    )}
                  </button>
                </div>
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-highlight-gold text-white px-3 py-1 rounded-full text-sm">
                    {product.badge}
                  </span>
                )}
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
    </section>
  );
}

export default FeaturedProducts;
