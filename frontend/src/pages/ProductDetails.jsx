import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const productData = {
  bats: {
    id: "bats",
    name: "Premium Cricket Bat",
    price: 199.99,
    images: ["/images/hero1.jpg", "/images/hero2.jpg", "/images/hero3.jpg"],
    description:
      "Professional grade cricket bat made from premium English willow. Perfect balance and excellent pickup make this bat a favorite among professional players.",
    isFavorite: false,
  },
  balls: {
    id: "balls",
    name: "Professional Cricket Ball",
    price: 29.99,
    images: ["/images/hero2.jpg", "/images/hero1.jpg", "/images/hero3.jpg"],
    description:
      "High-quality leather cricket ball suitable for professional matches. Hand-stitched for durability and consistent performance.",
    isFavorite: false,
  },
  // Add more products as needed
};

function ProductDetails() {
  const { category } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [products, setProducts] = useState(productData);
  const navigate = useNavigate();

  const product = products[category];

  if (!product) return <div>Product not found</div>;

  const toggleFavorite = () => {
    setProducts({
      ...products,
      [category]: {
        ...product,
        isFavorite: !product.isFavorite,
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Carousel */}
        <div className="space-y-4">
          <div className="relative h-96 overflow-hidden rounded-lg">
            <img
              src={product.images[currentImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex space-x-4">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImage(index)}
                className={`w-20 h-20 rounded-lg overflow-hidden ${
                  currentImage === index
                    ? "ring-2 ring-primary-blue"
                    : "opacity-75"
                }`}
              >
                <img
                  src={image}
                  alt={`${product.name} view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <h1 className="text-3xl font-bold text-neutral-darkGray">
              {product.name}
            </h1>
            <button
              onClick={toggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {product.isFavorite ? (
                <HeartSolid className="h-6 w-6 text-highlight-red" />
              ) : (
                <HeartOutline className="h-6 w-6 text-neutral-darkGray hover:text-highlight-red" />
              )}
            </button>
          </div>
          <p className="text-2xl font-bold text-primary-green">
            ${product.price}
          </p>
          <p className="text-gray-600">{product.description}</p>
          <div className="flex space-x-4">
            <button className="flex-1 px-8 py-3 bg-accent-yellow text-neutral-darkGray rounded-full font-semibold hover:bg-accent-orange transition-colors">
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-neutral-darkGray mb-6">
          Related Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Object.values(products)
            .filter((p) => p.id !== product.id)
            .slice(0, 4)
            .map((relatedProduct) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/product/${relatedProduct.id}`)}
              >
                <div className="relative">
                  <img
                    src={relatedProduct.images[0]}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  {relatedProduct.isFavorite && (
                    <HeartSolid className="absolute top-2 right-2 h-6 w-6 text-highlight-red" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-neutral-darkGray">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-primary-green font-bold mt-2">
                    ${relatedProduct.price}
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
