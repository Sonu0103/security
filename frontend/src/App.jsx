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
import { FavoritesProvider } from "./context/FavoritesContext";

// Admin imports
import AdminLayout from "./admin/components/AdminLayout";
import Products from "./admin/pages/Products";
import Orders from "./admin/pages/Orders";
import Users from "./admin/pages/Users";
import AdminProfile from "./admin/pages/Profile";

function App() {
  return (
    <FavoritesProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
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
                      <Orders />
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
                    <Route
                      path="/product/:category"
                      element={<ProductDetails />}
                    />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </FavoritesProvider>
  );
}

export default App;
