import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
};

// User APIs (Admin)
export const userAPI = {
  getAllUsers: () => api.get("/users"),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Product APIs
export const productAPI = {
  getAllProducts: () => api.get("/products"),
  getProduct: (id) => api.get(`/products/${id}`),
  getFeaturedProducts: () => api.get("/products/featured"),
  getProductsByCategory: (category) =>
    api.get(`/products/category/${category}`),
  // Admin routes
  createProduct: (productData) =>
    api.post("/products", productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  updateProduct: (id, productData) =>
    api.put(`/products/${id}`, productData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // For handling image uploads
  uploadProductImage: (formData) =>
    api.post("/products/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Order APIs
export const orderAPI = {
  // Customer routes
  createOrder: (orderData) => api.post("/orders", orderData),
  getMyOrders: () => api.get("/orders/my-orders"),

  // Admin routes
  getAllOrders: () => api.get("/orders"),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// Profile APIs
export const profileAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (userData) => api.put("/profile", userData),
  changePassword: (passwordData) => api.put("/profile/password", passwordData),
  updateAvatar: (formData) =>
    api.put("/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Admin Profile APIs
export const adminAPI = {
  getProfile: () => api.get("/admin/profile"),
  updateProfile: (userData) => api.put("/admin/profile", userData),
  changePassword: (passwordData) =>
    api.put("/admin/profile/password", passwordData),
  updateAvatar: (formData) =>
    api.put("/admin/profile/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

// Error handler helper
export const handleApiError = (error) => {
  const message =
    error.response?.data?.message || "Something went wrong. Please try again.";
  return {
    error: true,
    message,
  };
};

// Example usage of APIs with error handling:
/*
try {
  const { data } = await productAPI.getAllProducts();
  return data;
} catch (error) {
  return handleApiError(error);
}
*/

// Example of using the APIs in components:
/*
import { productAPI, handleApiError } from '../api/apis';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    try {
      const { data } = await productAPI.getAllProducts();
      setProducts(data.products);
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
    }
  };
};
*/
