import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { orderAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";
import LoadingOverlay from "../components/common/LoadingOverlay";

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
    paymentMethod: "cash", // or "esewa"
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    // Check if cart is empty
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      navigate("/cart");
    }

    // Check authentication
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to checkout");
      navigate("/login");
    }

    // Check for payment error message
    const paymentError = sessionStorage.getItem("paymentError");
    if (paymentError) {
      toast.error(paymentError);
      sessionStorage.removeItem("paymentError");
    }

    // Clean up any pending order IDs
    return () => {
      sessionStorage.removeItem("pendingOrderId");
    };
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

    setIsSubmitting(true);

    try {
      const orderData = {
        shippingAddress: formData,
        paymentMethod: formData.paymentMethod,
      };

      const { data } = await orderAPI.createOrder(orderData);

      if (formData.paymentMethod === "esewa") {
        setIsProcessingPayment(true);
        // Create form and submit to eSewa
        const form = document.createElement("form");
        form.setAttribute("method", "POST");
        form.setAttribute("action", data.esewaUrl);
        form.setAttribute("id", "esewa-payment-form");

        // Add eSewa parameters
        Object.entries(data.esewaData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.setAttribute("type", "hidden");
          input.setAttribute("name", key);
          input.setAttribute("value", value);
          form.appendChild(input);
        });

        // Store order ID and cart data in sessionStorage for reference
        sessionStorage.setItem("pendingOrderId", data.order._id);
        sessionStorage.setItem("pendingOrderAmount", total.toString());

        // Show processing message
        toast.loading("Redirecting to eSewa payment...", {
          duration: 2000,
        });

        // Small delay to show the loading message
        setTimeout(() => {
          // Append form to body and submit
          document.body.appendChild(form);
          form.submit();
          form.remove(); // Clean up the form after submission
        }, 1500);
      } else {
        // For cash payment
        await clearCart(); // Clear the cart after successful cash order
        toast.success("Order placed successfully!");
        navigate("/orders", {
          state: {
            orderId: data.order._id,
            orderDetails: data.order,
          },
        });
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
      setIsSubmitting(false);
      setIsProcessingPayment(false);
    }
  };

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  return (
    <>
      {isProcessingPayment && (
        <LoadingOverlay message="Redirecting to eSewa payment..." />
      )}
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-neutral-darkGray mb-8">
          Checkout
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping and Payment Form */}
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
                    <label className="block text-gray-700 mb-2">
                      Full Name
                    </label>
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

              {/* Payment Method */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-neutral-darkGray mb-4">
                  Payment Method
                </h2>
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={formData.paymentMethod === "cash"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className="form-radio text-primary-blue"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="payment"
                      value="esewa"
                      checked={formData.paymentMethod === "esewa"}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className="form-radio text-primary-blue"
                    />
                    <span>eSewa</span>
                  </label>
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
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center gap-4"
                  >
                    <img
                      src={getFullImageUrl(item.product.image)}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
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
                ))}
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
                disabled={isSubmitting || isProcessingPayment}
                className="w-full mt-6 bg-accent-yellow text-neutral-darkGray py-3 rounded-full font-semibold hover:bg-accent-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingPayment
                  ? "Redirecting to eSewa..."
                  : isSubmitting
                  ? "Processing..."
                  : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
