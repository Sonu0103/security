import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PencilIcon } from "@heroicons/react/24/outline";
import { profileAPI, orderAPI, wishlistAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";

// Add helper function for image URLs
const getFullImageUrl = (imagePath) => {
  if (!imagePath) return "/images/placeholder.png";
  if (imagePath.startsWith("data:") || imagePath.startsWith("blob:"))
    return imagePath;
  if (imagePath.startsWith("http")) {
    // Convert https to http if needed
    return imagePath.replace("https://localhost", "http://localhost");
  }
  return `${import.meta.env.VITE_BACKEND_URL}${imagePath}`;
};

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
    fetchOrders();
    fetchWishlist();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await profileAPI.getProfile();
      setUser(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getUserOrders();
      console.log("Orders response:", data);
      if (data.orders && data.orders.length > 0) {
        console.log("First order items:", data.orders[0].items);
        console.log(
          "First item image path:",
          data.orders[0].items[0]?.product?.image
        );
      }
      if (!data.orders) {
        console.error("No orders array in response:", data);
        setOrders([]);
        return;
      }
      setOrders(data.orders);
    } catch (error) {
      console.error("Error fetching orders:", error.response || error);
      const { message } = handleApiError(error);
      toast.error("Failed to fetch orders: " + message);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const { data } = await wishlistAPI.getWishlist();
      console.log("Wishlist response:", data);
      if (data.wishlistItems && data.wishlistItems.length > 0) {
        console.log("First wishlist item:", data.wishlistItems[0]);
        console.log(
          "First wishlist item image path:",
          data.wishlistItems[0]?.product?.image
        );
      }
      if (!data.wishlistItems) {
        console.error("No wishlist items array in response:", data);
        setWishlist([]);
        return;
      }
      setWishlist(data.wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error.response || error);
      const { message } = handleApiError(error);
      toast.error("Failed to fetch wishlist: " + message);
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // If password fields are filled, update password
      if (formData.currentPassword && formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          toast.error("New passwords don't match");
          return;
        }
        await profileAPI.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        toast.success("Password updated successfully");
      }

      // Update profile info
      const { data } = await profileAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setUser(data.user);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const { data } = await profileAPI.updateAvatar(formData);
      setUser(data.user);
      toast.success("Profile photo updated successfully");
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderOrders = () => {
    if (!orders.length) {
      return <p>No orders found.</p>;
    }

    return orders.map((order) => (
      <div key={order._id} className="order-item">
        {order.items?.map((item) => {
          if (!item || !item.product) return null;

          return (
            <div key={item._id} className="order-product">
              <img
                src={getFullImageUrl(item.product.image)}
                alt={item.product.name || "Product"}
              />
              <div className="product-details">
                <h4>{item.product.name || "Product Name Unavailable"}</h4>
                <p>Quantity: {item.quantity}</p>
                <p>Price: ${item.price}</p>
              </div>
            </div>
          );
        })}
        <div className="order-info">
          <p>Order ID: {order._id}</p>
          <p>Total: ${order.totalAmount.toFixed(2)}</p>
          <p>
            Status:{" "}
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </p>
        </div>
      </div>
    ));
  };

  const renderWishlist = () => {
    if (!wishlist.length) {
      return <p>Your wishlist is empty.</p>;
    }

    return wishlist.map((item) => {
      if (!item || !item.product) return null;

      return (
        <div key={item._id} className="wishlist-item">
          <img
            src={getFullImageUrl(item.product.image)}
            alt={item.product.name || "Product"}
          />
          <div className="product-details">
            <h4>{item.product.name || "Product Name Unavailable"}</h4>
            <p>Price: ${item.product.price.toFixed(2)}</p>
          </div>
        </div>
      );
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-darkGray mb-8">
        My Profile
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Personal Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-darkGray">
                Personal Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-primary-blue hover:text-blue-600 flex items-center gap-2"
              >
                <PencilIcon className="h-5 w-5" />
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50 disabled:bg-gray-100"
                  />
                </div>
              </div>

              {isEditing && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-neutral-darkGray mb-4">
                      Change Password
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                        />
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium mb-1">
                            Password must contain:
                          </p>
                          <ul className="list-disc pl-5 space-y-1">
                            <li
                              className={
                                formData.newPassword.length >= 8
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }
                            >
                              At least 8 characters
                            </li>
                            <li
                              className={
                                /[A-Z]/.test(formData.newPassword)
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }
                            >
                              One uppercase letter
                            </li>
                            <li
                              className={
                                /[a-z]/.test(formData.newPassword)
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }
                            >
                              One lowercase letter
                            </li>
                            <li
                              className={
                                /[0-9]/.test(formData.newPassword)
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }
                            >
                              One number
                            </li>
                            <li
                              className={
                                /[!@#$%^&*(),.?":{}|<>]/.test(
                                  formData.newPassword
                                )
                                  ? "text-green-500"
                                  : "text-gray-500"
                              }
                            >
                              One special character
                            </li>
                            <li
                              className={
                                !/\s/.test(formData.newPassword)
                                  ? "text-green-500"
                                  : "text-red-500"
                              }
                            >
                              No spaces allowed
                            </li>
                          </ul>
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700 mb-2">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                        />
                        {formData.newPassword && formData.confirmPassword && (
                          <p
                            className={`mt-1 text-sm ${
                              formData.newPassword === formData.confirmPassword
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {formData.newPassword === formData.confirmPassword
                              ? "Passwords match"
                              : "Passwords do not match"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-primary-blue text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Security Information */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-neutral-darkGray mb-6">
              Security Information
            </h2>

            {/* Password Status */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-neutral-darkGray mb-2">
                  Password Status
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Password Expiry:</span>
                    <span
                      className={`font-medium ${
                        new Date(user.passwordExpiresAt) <= new Date()
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {(() => {
                        try {
                          const today = new Date();
                          const expiryDate = new Date(user.passwordExpiresAt);

                          // Calculate days remaining
                          const timeDiff =
                            expiryDate.getTime() - today.getTime();
                          const daysRemaining = Math.ceil(
                            timeDiff / (1000 * 3600 * 24)
                          );

                          if (daysRemaining <= 0) {
                            return "Password Expired";
                          }

                          return `${daysRemaining} days remaining`;
                        } catch (error) {
                          console.error("Date calculation error:", error);
                          return "Error calculating expiry";
                        }
                      })()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Last Changed:</span>
                    <span className="text-gray-600">
                      {user.passwordChangedAt &&
                      user.passwordChangedAt !== user.joinDate
                        ? new Date(user.passwordChangedAt).toLocaleDateString()
                        : `Set on account creation (${new Date(
                            user.joinDate
                          ).toLocaleDateString()})`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-darkGray mb-2">
                  Account Security
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">Account Status:</span>
                    <span
                      className={`font-medium ${
                        user.accountLockUntil &&
                        new Date(user.accountLockUntil) > new Date()
                          ? "text-red-500"
                          : "text-green-500"
                      }`}
                    >
                      {user.accountLockUntil &&
                      new Date(user.accountLockUntil) > new Date()
                        ? `Locked (${Math.ceil(
                            (new Date(user.accountLockUntil) - new Date()) /
                              (1000 * 60)
                          )} minutes remaining)`
                        : "Active"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700">
                      Failed Login Attempts:
                    </span>
                    <span
                      className={`font-medium ${
                        user.failedLoginAttempts === 0
                          ? "text-green-500"
                          : user.failedLoginAttempts >= 3
                          ? "text-red-500"
                          : "text-orange-500"
                      }`}
                    >
                      {user.failedLoginAttempts} of 5 attempts
                      {user.failedLoginAttempts >= 3 &&
                        user.failedLoginAttempts < 5 && (
                          <span className="text-xs ml-2 text-red-500">
                            ({5 - user.failedLoginAttempts} attempts remaining)
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Last Login:</span>
                    <span className="text-gray-600">
                      {new Date(user.lastLogin).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-darkGray mb-2">
                  Security Requirements
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Password Requirements:</span>
                    <ul className="list-disc ml-5 mt-1">
                      <li>8-30 characters long</li>
                      <li>At least one uppercase letter</li>
                      <li>At least one lowercase letter</li>
                      <li>At least one number</li>
                      <li>At least one special character</li>
                      <li>No spaces allowed</li>
                    </ul>
                  </div>
                  <div className="text-sm text-gray-700 mt-3">
                    <span className="font-medium">Account Security:</span>
                    <ul className="list-disc ml-5 mt-1">
                      <li>Password expires every 90 days</li>
                      <li>Cannot reuse last 3 passwords</li>
                      <li>Account locks after 5 failed login attempts</li>
                      <li>15-minute lockout period after failed attempts</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Security Recommendations */}
              {(user.failedLoginAttempts > 2 ||
                new Date(user.passwordExpiresAt) <=
                  new Date(+new Date() + 7 * 24 * 60 * 60 * 1000)) && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Security Recommendations
                  </h4>
                  <ul className="list-disc ml-5 text-yellow-700">
                    {user.failedLoginAttempts > 2 && (
                      <li>
                        Multiple failed login attempts detected. Consider
                        changing your password.
                      </li>
                    )}
                    {new Date(user.passwordExpiresAt) <=
                      new Date(+new Date() + 7 * 24 * 60 * 60 * 1000) && (
                      <li>
                        Your password will expire soon. Please change it to
                        maintain account security.
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-neutral-darkGray mb-6">
              Order History
            </h2>
            <div className="space-y-6">
              {ordersLoading ? (
                <p className="text-gray-500 text-center">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-gray-500 text-center">No orders found</p>
              ) : (
                <div className="orders-list">{renderOrders()}</div>
              )}
            </div>
          </div>
        </div>

        {/* Wishlist Preview */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-darkGray">
                My Wishlist
              </h2>
              <button
                onClick={() => navigate("/wishlist")}
                className="text-primary-blue hover:underline"
              >
                View All
              </button>
            </div>
            <div className="space-y-4">
              {wishlistLoading ? (
                <p className="text-gray-500 text-center">Loading wishlist...</p>
              ) : wishlist.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No items in wishlist
                </p>
              ) : (
                <div className="wishlist-list">{renderWishlist()}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image */}
      <div className="mt-8">
        <div className="text-center">
          <div className="relative w-40 h-40 mx-auto mb-4 group">
            <img
              src={
                user?.avatar
                  ? getFullImageUrl(user.avatar)
                  : "/images/default-avatar.png"
              }
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                if (!e.target.getAttribute("data-error-handled")) {
                  e.target.setAttribute("data-error-handled", "true");
                  e.target.src = "/images/default-avatar.png";
                  console.error("Avatar load error:", user?.avatar);
                }
              }}
            />
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
              <span className="text-white text-sm">Change Photo</span>
            </label>
          </div>
          {isEditing && (
            <p className="text-sm text-gray-500">Click photo to change</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
