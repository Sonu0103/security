import { useNavigate } from "react-router-dom";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

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

function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateCartItem, removeFromCart, cartTotal, loading } =
    useCart();
  const [updatingItems, setUpdatingItems] = useState({});
  const shipping = 10;
  const total = cartTotal + shipping;

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view your cart");
      navigate("/login");
      return;
    }
  }, [navigate]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-darkGray mb-4">
            Your Cart is Empty
          </h1>
          <p className="text-gray-600 mb-8">
            Add some products to your cart and start shopping!
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

  const handleQuantityChange = async (productId, newQuantity, stock) => {
    if (!productId) return;
    try {
      if (newQuantity < 1 || newQuantity > stock) return;

      setUpdatingItems((prev) => ({ ...prev, [productId]: true }));
      await updateCartItem(productId, newQuantity);
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleRemoveItem = async (productId) => {
    if (!productId) return;
    try {
      setUpdatingItems((prev) => ({ ...prev, [productId]: true }));
      await removeFromCart(productId);
    } catch (error) {
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-darkGray mb-8">
        Shopping Cart
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => {
            // Skip rendering if product is null or undefined
            if (!item?.product) return null;

            return (
              <div
                key={item.product._id}
                className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
              >
                <img
                  src={getFullImageUrl(item.product.image)}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                  onClick={() => navigate(`/product/${item.product._id}`)}
                  onError={(e) => {
                    if (!e.target.getAttribute("data-error-handled")) {
                      e.target.setAttribute("data-error-handled", "true");
                      e.target.src = "/images/placeholder.png";
                      console.error("Image load error:", item.product.image);
                    }
                  }}
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-neutral-darkGray">
                    {item.product.name}
                  </h3>
                  <p className="text-primary-green font-bold">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center border rounded">
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity - 1,
                            item.product.stock
                          )
                        }
                        className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={
                          item.quantity <= 1 || updatingItems[item.product._id]
                        }
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleQuantityChange(
                            item.product._id,
                            item.quantity + 1,
                            item.product.stock
                          )
                        }
                        className="px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                        disabled={
                          item.quantity >= item.product.stock ||
                          updatingItems[item.product._id]
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.product._id)}
                      className="text-highlight-red hover:text-red-700 transition-colors disabled:opacity-50"
                      disabled={updatingItems[item.product._id]}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-neutral-darkGray mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between font-bold text-neutral-darkGray">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="w-full mt-6 bg-accent-yellow text-neutral-darkGray py-3 rounded-lg font-semibold hover:bg-accent-orange transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
