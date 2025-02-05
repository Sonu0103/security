import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { orderAPI, handleApiError } from "../api/apis";
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

function Checkout() {
  const navigate = useNavigate();
  const { cartItems, cartTotal, clearCart } = useCart();
  const shipping = 10;
  const total = cartTotal + shipping;

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    paymentMethod: "cash",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if cart is empty
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
  }, [cartItems, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate cart items before proceeding
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
      return;
    }

    // Check if all products in cart are valid
    const invalidItems = cartItems.filter((item) => {
      if (!item || !item.product || !item.product._id) {
        console.log("Invalid item structure:", item);
        return true;
      }

      if (typeof item.quantity !== "number" || item.quantity < 1) {
        console.log("Invalid quantity:", item);
        return true;
      }

      if (typeof item.product.price !== "number" || item.product.price < 0) {
        console.log("Invalid price:", item.product);
        return true;
      }

      if (typeof item.product.stock !== "number") {
        console.log("Invalid stock:", item.product);
        return true;
      }

      return false;
    });

    if (invalidItems.length > 0) {
      console.log("Invalid items found:", invalidItems);
      toast.error(
        "Some items in your cart are invalid. Please try refreshing the page."
      );
      return;
    }

    // Check if any item quantity exceeds available stock
    const outOfStockItems = cartItems.filter((item) => {
      const isOutOfStock = item.quantity > item.product.stock;
      if (isOutOfStock) {
        console.log("Out of stock item:", {
          product: item.product.name,
          requested: item.quantity,
          available: item.product.stock,
        });
      }
      return isOutOfStock;
    });

    if (outOfStockItems.length > 0) {
      const itemNames = outOfStockItems
        .map((item) => item.product.name)
        .join(", ");
      toast.error(`The following items are out of stock: ${itemNames}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        shippingAddress: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
        },
        paymentMethod: "cash",
        items: cartItems.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
      };

      const { data } = await orderAPI.createOrder(orderData);
      await clearCart();
      toast.success("Order placed successfully!");
      navigate("/orders", {
        state: {
          orderId: data.order._id,
          orderDetails: data.order,
        },
      });
    } catch (error) {
      console.error("Order creation error:", error);
      const { message } = handleApiError(error);
      toast.error(message || "Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-darkGray mb-8">
        Checkout
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information Form */}
        <div className="lg:col-span-2">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-neutral-darkGray mb-4">
                Shipping Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.fullName
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.email
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.phone
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.phone}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.address
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.address && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.address}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.city
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.city && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.city}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.state
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.state && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.state}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.zipCode
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Information - Cash on Delivery Only */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-neutral-darkGray mb-4">
                Payment Method
              </h2>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={true}
                  readOnly
                  className="form-radio text-primary-blue"
                />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-neutral-darkGray mb-4">
              Order Summary
            </h2>
            <div className="space-y-4 mb-4">
              {cartItems.map((item) => {
                if (!item?.product) return null;

                return (
                  <div
                    key={item.product._id}
                    className="flex items-center gap-4 py-4 border-b last:border-0"
                  >
                    <img
                      src={getFullImageUrl(item.product.image)}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        if (!e.target.getAttribute("data-error-handled")) {
                          e.target.setAttribute("data-error-handled", "true");
                          e.target.src = "/images/placeholder.png";
                          console.error(
                            "Image load error:",
                            item.product.image
                          );
                        }
                      }}
                    />
                    <div className="flex-grow">
                      <h3 className="text-sm font-semibold text-neutral-darkGray">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Qty: {item.quantity} × ${item.product.price}
                      </p>
                    </div>
                    <p className="font-semibold text-neutral-darkGray">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="space-y-3 text-gray-600 border-t pt-4">
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
              type="submit"
              form="checkout-form"
              disabled={isSubmitting}
              className={`w-full mt-6 py-3 rounded-lg font-semibold ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-accent-yellow hover:bg-accent-orange"
              } text-neutral-darkGray transition-colors`}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
