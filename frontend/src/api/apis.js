import axios from "axios";

const API_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with cross-origin requests
});

// Add CSRF token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN"))
      ?.split("=")[1];
    if (csrfToken) {
      config.headers["X-XSRF-TOKEN"] = csrfToken;
    }
    return config;
  },
  (error) => {
    console.error("Request failed:", error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only log important errors
    if (error.response?.status === 401) {
      console.warn("Session expired. Please login again.");
      // Clear auth data on unauthorized
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastPasswordChange");

      // Redirect to login if not already there
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    } else if (error.response?.status === 500) {
      console.error("Server error:", error.response.data.message);
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
      }
      return response;
    } catch (error) {
      if (error.response?.status === 401) {
        console.error("Login failed: Invalid credentials");
      }
      throw error;
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("lastPasswordChange");
      delete api.defaults.headers.common["Authorization"];
    }
  },
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
  getUserOrders: () => api.get("/orders"),

  // Admin routes
  getAllOrders: () => api.get("/orders/admin"),
  getOrderDetails: (id) => api.get(`/orders/admin/${id}`),
  updateOrder: (id, orderData) => api.put(`/orders/admin/${id}`, orderData),
  deleteOrder: (id) => api.delete(`/orders/admin/${id}`),
  getRecentDeliveries: () => api.get("/orders/admin/recent-deliveries"),
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

// Add these to your existing apis.js file
export const wishlistAPI = {
  getWishlist: () => api.get("/wishlist"),
  addToWishlist: (productId) => api.post("/wishlist", { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
};

// Add these to your existing apis.js file
export const cartAPI = {
  getCart: () => api.get("/cart"),
  addToCart: (productId, quantity = 1) =>
    api.post("/cart", { productId, quantity }),
  updateCartItem: (productId, quantity) =>
    api.put(`/cart/${productId}`, { quantity }),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
};

// Error handler helper
export const handleApiError = (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastPasswordChange");
  }

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

export default api;
