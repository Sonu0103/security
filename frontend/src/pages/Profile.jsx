import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PencilIcon } from "@heroicons/react/24/outline";
import { profileAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";

function Profile() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
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

  // Mock order history data
  const orders = [
    {
      id: "ORD-123",
      date: "2024-03-15",
      status: "Delivered",
      total: 229.98,
      items: [
        {
          id: "bats",
          name: "Premium Cricket Bat",
          price: 199.99,
          quantity: 1,
          image: "/images/hero1.jpg",
        },
        {
          id: "balls",
          name: "Professional Cricket Ball",
          price: 29.99,
          quantity: 1,
          image: "/images/hero2.jpg",
        },
      ],
    },
    // Add more orders as needed
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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

          {/* Order History */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-xl font-bold text-neutral-darkGray mb-6">
              Order History
            </h2>
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-neutral-darkGray">
                        Order #{order.id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-green">
                        ${order.total.toFixed(2)}
                      </p>
                      <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-100 text-green-800">
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-neutral-darkGray">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} × ${item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
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
              {/* Show last 3 wishlist items */}
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                  onClick={() => navigate(`/product/item-${item}`)}
                >
                  <img
                    src={`/images/hero${item}.jpg`}
                    alt={`Wishlist item ${item}`}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-neutral-darkGray">
                      Cricket Item {item}
                    </p>
                    <p className="text-primary-green font-semibold">
                      ${(99.99 * item).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
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
                  ? `${import.meta.env.VITE_BACKEND_URL}${user.avatar}`
                  : "/default-avatar.jpg"
              }
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
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
