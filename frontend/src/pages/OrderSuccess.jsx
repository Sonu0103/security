import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderDetails } = location.state || {};
  const paymentStatus = new URLSearchParams(location.search).get(
    "paymentStatus"
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-neutral-darkGray mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your order. Your order ID is: {orderId}
        </p>
        {paymentStatus === "completed" && (
          <p className="text-green-600 font-semibold mb-8">
            Payment has been successfully processed!
          </p>
        )}
        <div className="space-x-4">
          <button
            onClick={() => navigate("/orders")}
            className="bg-primary-blue text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Orders
          </button>
          <button
            onClick={() => navigate("/")}
            className="bg-accent-yellow text-neutral-darkGray px-6 py-2 rounded-lg hover:bg-accent-orange transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
