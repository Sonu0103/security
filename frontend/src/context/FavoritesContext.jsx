import { createContext, useContext, useState } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  const addToFavorites = (product) => {
    setFavorites((prev) => [...prev, { ...product, isFavorite: true }]);
  };

  const removeFromFavorites = (productId) => {
    setFavorites((prev) => prev.filter((product) => product.id !== productId));
  };

  const isFavorite = (productId) => {
    return favorites.some((product) => product.id === productId);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
