import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { orderAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";

function Orders() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    // Show success message if coming from successful payment
    const paymentSuccess = sessionStorage.getItem("paymentSuccess");
    if (paymentSuccess) {
      toast.success("Payment successful! Your order has been placed.");
      sessionStorage.removeItem("paymentSuccess");
    }
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getUserOrders();
      setOrders(data.orders);
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-darkGray mb-4">
            Your Orders
          </h1>
          <p className="text-gray-600 mb-8">
            You haven't placed any orders yet.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-darkGray mb-8">
        Your Orders
      </h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">
                    Order placed: {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm font-semibold text-primary-blue">
                    Status:{" "}
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center gap-4">
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
                        Qty: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <p className="font-semibold text-neutral-darkGray">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-neutral-darkGray mb-2">
                  Shipping Address
                </h4>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.address}
                </p>
                <p className="text-sm text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Orders;
