import { createContext, useContext, useState, useEffect } from "react";
import { wishlistAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await wishlistAPI.getWishlist();
      setFavorites(data.wishlistItems.map((item) => item.product));
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Error fetching favorites:", message);
    } finally {
      setIsLoading(false);
    }
  };

  const addToFavorites = async (product) => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to add items to wishlist");
      window.location.href = "/login"; // Use window.location instead of navigate
      return;
    }

    try {
      await wishlistAPI.addToWishlist(product._id);
      setFavorites((prev) => [...prev, product]);
      toast.success("Added to wishlist");
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const removeFromFavorites = async (productId) => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to manage your wishlist");
      window.location.href = "/login"; // Use window.location instead of navigate
      return;
    }

    try {
      await wishlistAPI.removeFromWishlist(productId);
      setFavorites((prev) =>
        prev.filter((product) => product._id !== productId)
      );
      toast.success("Removed from wishlist");
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some((product) => product._id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        isLoading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
