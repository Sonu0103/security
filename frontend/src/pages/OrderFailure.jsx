import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { FiXCircle } from "react-icons/fi";

function OrderFailure() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const message = searchParams.get("message") || "Payment failed";

  useEffect(() => {
    // Clear any payment-related data from localStorage if needed
    localStorage.removeItem("pendingOrderId");
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <FiXCircle className="text-highlight-red text-6xl" />
        </div>
        <h1 className="text-2xl font-bold text-neutral-darkGray mb-4">
          Payment Failed
        </h1>
        <p className="text-neutral-gray mb-6">{message}</p>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-primary-blue text-white py-2 px-4 rounded-lg hover:bg-primary-blue/90 transition-colors"
          >
            Return to Cart
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-neutral-lightGray text-neutral-darkGray py-2 px-4 rounded-lg hover:bg-neutral-lightGray/90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderFailure;
