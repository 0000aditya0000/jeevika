'use client';
import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem('jc_cart') || '[]'));
      setWishlist(JSON.parse(localStorage.getItem('jc_wishlist') || '[]'));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => { if (hydrated) localStorage.setItem('jc_cart', JSON.stringify(cart)); }, [cart, hydrated]);
  useEffect(() => { if (hydrated) localStorage.setItem('jc_wishlist', JSON.stringify(wishlist)); }, [wishlist, hydrated]);

  const addToCart = (item) => {
    setCart(prev => {
      const key = `${item.productId}-${item.size||''}-${item.color||''}`;
      const existing = prev.find(p => `${p.productId}-${p.size||''}-${p.color||''}` === key);
      if (existing) return prev.map(p => p === existing ? { ...p, qty: p.qty + (item.qty||1) } : p);
      return [...prev, { ...item, qty: item.qty || 1 }];
    });
  };
  const updateQty = (idx, qty) => setCart(prev => prev.map((p,i) => i === idx ? { ...p, qty: Math.max(1, qty) } : p));
  const removeFromCart = (idx) => setCart(prev => prev.filter((_,i) => i !== idx));
  const clearCart = () => setCart([]);

  const toggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.productId === product.productId);
      if (exists) return prev.filter(p => p.productId !== product.productId);
      return [...prev, product];
    });
  };
  const isInWishlist = (productId) => wishlist.some(p => p.productId === productId);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartSubtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);

  return (
    <CartContext.Provider value={{ cart, wishlist, addToCart, updateQty, removeFromCart, clearCart, toggleWishlist, isInWishlist, cartCount, cartSubtotal, hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
