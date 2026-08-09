import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        if (!user) { setItems([]); return; }
        setLoading(true);
        try {
            const data = await api.getCart();
            setItems(data);
        } finally {
            setLoading(false);
        }
    }, [user]);

    async function addToCart(productId, quantity = 1) {
        const data = await api.addToCart(productId, quantity);
        setItems(data);
    }

    async function updateQuantity(cartItemId, quantity) {
        const data = await api.updateCartItem(cartItemId, quantity);
        setItems(data);
    }

    async function removeItem(cartItemId) {
        const data = await api.removeCartItem(cartItemId);
        setItems(data);
    }

    function clearLocal() {
        setItems([]);
    }

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const count = items.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, loading, refresh, addToCart, updateQuantity, removeItem, clearLocal, total, count }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}