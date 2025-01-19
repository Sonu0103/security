import { useNavigate } from "react-router-dom";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="mb-8 flex justify-center">
          <CheckCircleIcon className="h-24 w-24 text-primary-green" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-darkGray mb-4">
          Order Placed Successfully!
        </h1>
        <p className="text-gray-600 mb-4">
          Thank you for your purchase. Your order has been confirmed and will be
          shipped soon.
        </p>
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-neutral-darkGray mb-4">
            Order Details
          </h2>
          <div className="text-left space-y-2 mb-4">
            <p className="text-gray-600">
              Order Number:{" "}
              <span className="text-neutral-darkGray font-medium">
                #ORD-{Math.random().toString(36).substr(2, 9).toUpperCase()}
              </span>
            </p>
            <p className="text-gray-600">
              Estimated Delivery:{" "}
              <span className="text-neutral-darkGray font-medium">
                {new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="bg-primary-blue text-white px-8 py-3 rounded-full hover:bg-blue-600 transition-colors font-semibold"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;
