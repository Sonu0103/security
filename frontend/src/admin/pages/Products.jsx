import { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, PlusIcon } from "@heroicons/react/24/outline";
import ProductModal from "../components/ProductModal";
import { productAPI, handleApiError } from "../../api/apis";
import toast from "react-hot-toast";

function Products() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAllProducts();
      setProducts(data.products);
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (newProduct) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p._id === newProduct._id ? newProduct : p))
      );
    } else {
      setProducts((prev) => [newProduct, ...prev]);
    }
    setShowAddModal(false);
    setEditingProduct(null);
  };

  const handleDelete = async (productId) => {
    try {
      await productAPI.deleteProduct(productId);
      toast.success("Product deleted successfully");
      fetchProducts();
      setShowDeleteConfirm(null);
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Feedback Message */}
      {/* Feedback Message */}
      {/* Feedback Message */}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-neutral-darkGray">
          Product Management
        </h2>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowAddModal(true);
          }}
          className="bg-primary-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3">Image</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Featured</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-12 w-12 object-cover rounded"
                      onError={(e) => {
                        e.target.src = "/placeholder.png";
                        console.error("Image load error:", product.image);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">{product.name}</td>
                  <td className="px-6 py-4">{product.category}</td>
                  <td className="px-6 py-4">${product.price}</td>
                  <td className="px-6 py-4">{product.stock}</td>
                  <td className="px-6 py-4">
                    {product.isFeatured ? (
                      <span className="inline-block px-2 py-1 text-sm rounded-full bg-green-100 text-green-800">
                        Featured
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-sm rounded-full bg-gray-100 text-gray-800">
                        Standard
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowAddModal(true);
                        }}
                        className="text-primary-blue hover:text-blue-600"
                        title="Edit Product"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(product._id)}
                        className="text-highlight-red hover:text-red-600"
                        title="Delete Product"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={showAddModal || editingProduct !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSave}
        editingProduct={editingProduct}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-neutral-darkGray mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 bg-highlight-red text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
