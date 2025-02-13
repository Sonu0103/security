import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import SearchResults from "./pages/SearchResults";
import { FavoritesProvider } from "./context/FavoritesContext";
import { Toaster } from "react-hot-toast";
import { CartProvider } from "./context/CartContext";
import UserOrders from "./pages/Orders";
import OrderFailed from "./pages/OrderFailed";

// Admin imports
import AdminLayout from "./admin/components/AdminLayout";
import Products from "./admin/pages/Products";
import AdminOrders from "./admin/pages/Orders";
import Users from "./admin/pages/Users";
import AdminProfile from "./admin/pages/Profile";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <CartProvider>
        <FavoritesProvider>
          <Toaster position="top-right" />
          <Routes>
            {/* Admin Routes - Protected */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Routes>
                    <Route
                      path="/products"
                      element={
                        <AdminLayout>
                          <Products />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/orders"
                      element={
                        <AdminLayout>
                          <AdminOrders />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/users"
                      element={
                        <AdminLayout>
                          <Users />
                        </AdminLayout>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <AdminLayout>
                          <AdminProfile />
                        </AdminLayout>
                      }
                    />
                    {/* Redirect /admin to /admin/products */}
                    <Route
                      path="/"
                      element={<Navigate to="/admin/products" replace />}
                    />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Client Routes */}
            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col">
                  <Header />
                  <main className="flex-grow">
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/search" element={<SearchResults />} />
                      <Route
                        path="/products/category/:category"
                        element={<ProductDetails />}
                      />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/wishlist" element={<Wishlist />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />
                      <Route path="/order-failed" element={<OrderFailed />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/orders" element={<UserOrders />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </FavoritesProvider>
      </CartProvider>
    </Router>
  );
}

export default App;
