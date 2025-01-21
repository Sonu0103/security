import { createContext, useContext, useState, useEffect } from "react";
import { cartAPI, handleApiError } from "../api/apis";
import toast from "react-hot-toast";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch cart on mount and when user logs in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, []);

  // Calculate total whenever cart items change
  useEffect(() => {
    if (!cartItems || !Array.isArray(cartItems)) {
      setCartTotal(0);
      return;
    }

    const total = cartItems.reduce(
      (sum, item) => sum + (item?.product?.price || 0) * (item?.quantity || 0),
      0
    );
    setCartTotal(total);
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const { data } = await cartAPI.getCart();
      if (data.success) {
        setCartItems(data.items || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      const { message } = handleApiError(error);
      console.error("Error fetching cart:", message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await cartAPI.addToCart(productId, quantity);
      if (data.success) {
        setCartItems(data.items || []);
        toast.success("Item added to cart");
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      const { data } = await cartAPI.updateCartItem(productId, quantity);
      if (data.success) {
        setCartItems(data.items || []);
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const { data } = await cartAPI.removeFromCart(productId);
      if (data.success) {
        setCartItems(data.items || []);
        toast.success("Item removed from cart");
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast.error(message);
    }
  };

  const clearCart = async () => {
    try {
      setCartItems([]);
      setCartTotal(0);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const value = {
    cartItems: cartItems || [],
    cartTotal,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
