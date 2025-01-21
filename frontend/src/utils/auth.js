import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const checkAuth = () => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  return { isAuthenticated: !!token && !!user, user };
};

export const requireAuth = (action) => {
  const navigate = useNavigate();
  const { isAuthenticated } = checkAuth();

  if (!isAuthenticated) {
    toast.error("Please login to continue");
    navigate("/login");
    return false;
  }
  return true;
};
