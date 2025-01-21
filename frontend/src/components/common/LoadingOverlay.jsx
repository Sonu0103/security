import React from "react";

function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-blue mx-auto mb-4"></div>
        <p className="text-lg text-neutral-darkGray">{message}</p>
      </div>
    </div>
  );
}

export default LoadingOverlay;
