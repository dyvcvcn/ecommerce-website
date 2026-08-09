import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
    const { items, refresh, updateQuantity, removeItem, total, loading } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        refresh();
    }, [user]);

    if (loading) return <div className="container"><p>Loading cart...</p></div>;

    return (
        <div className="container">
            <h1>Your Cart</h1>
            {items.length === 0 ? (
                <p>Your cart is empty. <Link to="/">Continue shopping</Link></p>
            ) : (
                <>
                    <div className="cart-list">
                        {items.map((item) => (
                            <div className="cart-row" key={item.cart_item_id}>
                                <img src={item.image_url} alt={item.name} />
                                <div className="cart-row-info">
                                    <span className="product-name">{item.name}</span>
                                    <span className="price">₹{item.price.toLocaleString('en-IN')}</span>
                                </div>
                                <input
                                    type="number"
                                    min="1"
                                    max={item.stock}
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.cart_item_id, Math.max(1, Number(e.target.value)))}
                                />
                                <span className="line-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                <button className="link-btn" onClick={() => removeItem(item.cart_item_id)}>Remove</button>
                            </div>
                        ))}
                    </div>
                    <div className="cart-summary">
                        <span>Total: <strong>₹{total.toLocaleString('en-IN')}</strong></span>
                        <button className="btn" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
                    </div>
                </>
            )}
        </div>
    );
}