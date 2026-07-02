import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../utils/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [cartLoading, setCartLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], totalAmount: 0 }); return; }
    try {
      const { data } = await cartAPI.getCart();
      setCart(data.cart);
    } catch (err) {
      console.error('Fetch cart error:', err);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error('Please login to add items to cart'); return false; }
    setCartLoading(true);
    try {
      const { data } = await cartAPI.addToCart(productId, quantity);
      setCart(data.cart);
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    setCartLoading(true);
    try {
      const { data } = await cartAPI.updateItem(itemId, quantity);
      setCart(data.cart);
    } catch (err) {
      toast.error('Failed to update quantity');
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    setCartLoading(true);
    try {
      const { data } = await cartAPI.removeItem(itemId);
      setCart(data.cart);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setCartLoading(false);
    }
  };

  const clearCart = () => setCart({ items: [], totalAmount: 0 });

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, cartLoading, addToCart, updateQuantity, removeFromCart, clearCart, fetchCart, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
