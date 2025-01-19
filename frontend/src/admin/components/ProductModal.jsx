import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

function ProductModal({ isOpen, onClose, onSave, editingProduct }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    stock: "",
    isFeatured: false,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  const categories = [
    "Bats",
    "Balls",
    "Kits",
    "Protection",
    "Clothing",
    "Shoes",
  ];

  // Reset form when modal opens/closes or editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || "",
        category: editingProduct.category,
        price: editingProduct.price,
        stock: editingProduct.stock,
        isFeatured: editingProduct.isFeatured || false,
      });
      setImagePreview(editingProduct.image);
    } else {
      setFormData({
        name: "",
        description: "",
        category: "",
        price: "",
        stock: "",
        isFeatured: false,
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [editingProduct, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (formData.price <= 0) newErrors.price = "Price must be greater than 0";
    if (!formData.stock) newErrors.stock = "Stock quantity is required";
    if (formData.stock < 0)
      newErrors.stock = "Stock quantity cannot be negative";
    if (!imagePreview) newErrors.image = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({ ...formData, image: imagePreview });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-darkGray">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.name
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.description
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  />
                  {errors.description && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors.category
                        ? "border-highlight-red ring-highlight-red/50"
                        : "focus:ring-primary-blue/50"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-highlight-red text-sm mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 mb-2">Price *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.price
                          ? "border-highlight-red ring-highlight-red/50"
                          : "focus:ring-primary-blue/50"
                      }`}
                    />
                    {errors.price && (
                      <p className="text-highlight-red text-sm mt-1">
                        {errors.price}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Stock *</label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        errors.stock
                          ? "border-highlight-red ring-highlight-red/50"
                          : "focus:ring-primary-blue/50"
                      }`}
                    />
                    {errors.stock && (
                      <p className="text-highlight-red text-sm mt-1">
                        {errors.stock}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-primary-blue rounded border-gray-300 focus:ring-primary-blue"
                  />
                  <label className="ml-2 text-gray-700">Featured Product</label>
                </div>
              </div>

              {/* Right Column - Image Upload & Preview */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Product Image *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center ${
                      errors.image
                        ? "border-highlight-red"
                        : "border-gray-300 hover:border-primary-blue"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer block"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="mx-auto max-h-64 object-contain"
                        />
                      ) : (
                        <div className="py-8">
                          <p className="text-gray-500">
                            Click to upload product image
                          </p>
                          <p className="text-sm text-gray-400">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                      )}
                    </label>
                    {errors.image && (
                      <p className="text-highlight-red text-sm mt-1">
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>

                {/* Product Preview Card */}
                {formData.name && (
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Product Preview
                    </h3>
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="aspect-w-1 aspect-h-1">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt={formData.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200" />
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-neutral-darkGray">
                          {formData.name}
                        </h4>
                        <p className="text-primary-green font-bold mt-2">
                          ${Number(formData.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save Product
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
