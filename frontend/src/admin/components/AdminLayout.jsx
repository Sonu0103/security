import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CubeIcon,
  ShoppingCartIcon,
  UsersIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState(null);

  // Get user data on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const isActive = (path) => location.pathname === `/admin${path}`;

  const menuItems = [
    { path: "/products", icon: CubeIcon, label: "Products" },
    { path: "/orders", icon: ShoppingCartIcon, label: "Orders" },
    { path: "/users", icon: UsersIcon, label: "Users" },
  ];

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleNavigation = (path) => {
    setShowProfileMenu(false); // Close dropdown after navigation
    navigate(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md fixed h-full">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-neutral-darkGray">
            Admin Panel
          </h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={`/admin${item.path}`}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? "bg-primary-blue text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-gray-50 min-h-screen">
        {/* Top Header */}
        <div className="bg-white shadow-sm">
          <div className="flex justify-end items-center px-8 py-4">
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-neutral-darkGray hover:text-primary-blue transition-colors focus:outline-none"
              >
                {user?.avatar ? (
                  <img
                    src={`${import.meta.env.VITE_BACKEND_URL}${user.avatar}`}
                    alt={user.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-blue text-white flex items-center justify-center">
                    {user?.name?.charAt(0).toUpperCase() || (
                      <UserCircleIcon className="h-6 w-6" />
                    )}
                  </div>
                )}
                <span>{user?.name}</span>
                <ChevronDownIcon
                  className={`h-4 w-4 transition-transform ${
                    showProfileMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <button
                    onClick={() => handleNavigation("/admin/profile")}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <UserCircleIcon className="h-5 w-5" />
                    Profile
                  </button>
                  <button
                    onClick={() => handleNavigation("/admin/orders")}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    Orders
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-highlight-red hover:bg-gray-50 w-full text-left"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>

      {/* Overlay to close dropdown when clicking outside */}
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;
