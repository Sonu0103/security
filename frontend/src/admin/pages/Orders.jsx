import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { orderAPI, handleApiError } from "../../api/apis";
import toast from "react-hot-toast";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const orderStatuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    fetchOrders();
    fetchRecentDeliveries();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log("Fetching orders...");
      const { data } = await orderAPI.getAllOrders();
      console.log("Orders response:", data);
      if (!data.orders) {
        console.error("No orders array in response:", data);
        setOrders([]);
        return;
      }
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error.response || error);
      const { message } = handleApiError(error);
      toast.error("Failed to fetch orders: " + message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentDeliveries = async () => {
    try {
      const { data } = await orderAPI.getRecentDeliveries();
      setRecentDeliveries(data.recentDeliveries);
    } catch (error) {
      console.error("Error fetching recent deliveries:", error);
    }
  };

  const handleStatusUpdate = async (orderId, updates) => {
    try {
      setIsUpdating(true);
      await orderAPI.updateOrder(orderId, updates);
      toast.success("Order updated successfully");
      fetchOrders();
      fetchRecentDeliveries();
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (order.user?.email || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "" || order.status === statusFilter;

    const orderDate = new Date(order.createdAt);
    const matchesDateRange =
      (!dateRange.from || orderDate >= new Date(dateRange.from)) &&
      (!dateRange.to || orderDate <= new Date(dateRange.to));

    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/default-product.jpg";
    if (imagePath.startsWith("http")) return imagePath;
    return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Recent Deliveries Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Deliveries</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2">Order ID</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Delivered At</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Payment Method</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentDeliveries.map((order) => (
                <tr key={order._id}>
                  <td className="px-4 py-2 font-medium">{order._id}</td>
                  <td className="px-4 py-2">
                    {order.user?.name || "Unknown User"}
                  </td>
                  <td className="px-4 py-2">{formatDate(order.deliveredAt)}</td>
                  <td className="px-4 py-2">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-2 capitalize">
                    {order.paymentMethod === "esewa"
                      ? "eSewa"
                      : "Cash on Delivery"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
            >
              <option value="">All Statuses</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
            />
          </div>
          <div>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment Method</th>
                <th className="px-6 py-3">Payment Status</th>
                <th className="px-6 py-3">Order Status</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 font-medium">{order._id}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">
                        {order.user?.name || "Unknown User"}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.user?.email || "No email"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{formatDate(order.createdAt)}</td>
                  <td className="px-6 py-4">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-6 py-4 capitalize">
                    {order.paymentMethod === "esewa"
                      ? "eSewa"
                      : "Cash on Delivery"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block px-2 py-1 text-sm rounded-full ${
                          order.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {order.isPaid ? "Paid" : "Pending"}
                      </span>
                      {!order.isPaid && order.paymentMethod === "cash" && (
                        <button
                          onClick={() =>
                            handleStatusUpdate(order._id, { isPaid: true })
                          }
                          className="text-green-600 hover:text-green-700"
                          title="Mark as Paid"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order._id, {
                          status: e.target.value,
                        })
                      }
                      disabled={isUpdating || order.status === "delivered"}
                      className={`px-2 py-1 rounded border ${
                        order.status === "delivered"
                          ? "bg-green-50 border-green-200"
                          : order.status === "cancelled"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-primary-blue hover:text-blue-600"
                      title="View Details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-darkGray">
                  Order Details
                </h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-medium">{selectedOrder._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Order Date</p>
                    <p className="font-medium">
                      {formatDate(selectedOrder.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Method</p>
                    <p className="font-medium capitalize">
                      {selectedOrder.paymentMethod === "esewa"
                        ? "eSewa"
                        : "Cash on Delivery"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Status</p>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-block px-2 py-1 text-sm rounded-full ${
                          selectedOrder.isPaid
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedOrder.isPaid ? "Paid" : "Pending"}
                      </span>
                      {!selectedOrder.isPaid &&
                        selectedOrder.paymentMethod === "cash" && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(selectedOrder._id, {
                                isPaid: true,
                              })
                            }
                            className="text-green-600 hover:text-green-700"
                            title="Mark as Paid"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                        )}
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-600">Name</p>
                      <p className="font-medium">
                        {selectedOrder.user?.name || "Unknown User"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">
                        {selectedOrder.user?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Shipping Address</h3>
                  <div className="space-y-2">
                    <p>{selectedOrder.shippingAddress.fullName}</p>
                    <p>{selectedOrder.shippingAddress.address}</p>
                    <p>
                      {selectedOrder.shippingAddress.city},{" "}
                      {selectedOrder.shippingAddress.state}{" "}
                      {selectedOrder.shippingAddress.zipCode}
                    </p>
                    <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                      >
                        <img
                          src={getFullImageUrl(item.product?.image)}
                          alt={item.product?.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-grow">
                          <h4 className="font-medium">{item.product?.name}</h4>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × ${item.price}
                          </p>
                        </div>
                        <p className="font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        $
                        {(
                          selectedOrder.totalAmount - selectedOrder.shippingFee
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>${selectedOrder.shippingFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Order Status */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-4">Order Status</h3>
                  <div className="flex items-center gap-4">
                    <select
                      value={selectedOrder.status}
                      onChange={(e) =>
                        handleStatusUpdate(selectedOrder._id, {
                          status: e.target.value,
                        })
                      }
                      disabled={
                        isUpdating || selectedOrder.status === "delivered"
                      }
                      className={`px-3 py-2 rounded border ${
                        selectedOrder.status === "delivered"
                          ? "bg-green-50 border-green-200"
                          : selectedOrder.status === "cancelled"
                          ? "bg-red-50 border-red-200"
                          : "bg-yellow-50 border-yellow-200"
                      }`}
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
