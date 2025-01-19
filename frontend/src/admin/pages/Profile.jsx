import { useState, useEffect } from "react";
import { PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { adminAPI, handleApiError } from "../../api/apis";
import toast from "react-hot-toast";

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const { data } = await adminAPI.getProfile();
      setAdmin(data.admin);
      setStats(data.stats);
      setFormData({
        name: data.admin.name,
        email: data.admin.email,
        phone: data.admin.phone,
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
        await adminAPI.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        toast.success("Password updated successfully");
      }

      // Update profile info
      const { data } = await adminAPI.updateProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      setAdmin(data.admin);
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

      const { data } = await adminAPI.updateAvatar(formData);
      setAdmin(data.admin);
      toast.success("Profile photo updated successfully");
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Feedback Message */}
      {/* {feedback.message && (
        <div
          className={`p-4 rounded-lg ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {feedback.message}
        </div>
      )} */}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-neutral-darkGray">
              My Profile
            </h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-primary-blue hover:text-blue-600"
              >
                <PencilIcon className="h-5 w-5" />
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Image */}
            <div className="text-center">
              <div className="relative w-40 h-40 mx-auto mb-4 group">
                <img
                  src={
                    admin?.avatar
                      ? `${import.meta.env.VITE_BACKEND_URL}${admin.avatar}`
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

            {/* Profile Information */}
            <div className="md:col-span-2">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
                    />
                  </div>

                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: admin?.name,
                          email: admin?.email,
                          phone: admin?.phone,
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4">Personal Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Full Name</p>
                        <p className="font-medium">{admin?.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">{admin?.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone</p>
                        <p className="font-medium">{admin?.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Role</p>
                        <p className="font-medium">{admin?.role}</p>
                      </div>
                    </div>
                  </div>

                  {/* Account Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-4">Account Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-600">Join Date</p>
                        <p className="font-medium">
                          {new Date(admin?.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Last Login</p>
                        <p className="font-medium">
                          {new Date(admin?.lastLogin).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
