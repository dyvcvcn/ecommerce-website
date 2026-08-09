import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Checkout() {
    const { items, total, refresh, clearLocal } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shipping, setShipping] = useState({ name: user?.name || '', address: '', city: '', zip: '' });
    const [card, setCard] = useState({ cardNumber: '', expiry: '', cvc: '' });
    const [error, setError] = useState('');
    const [placing, setPlacing] = useState(false);

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        refresh();
    }, [user]);

    async function handlePlaceOrder(e) {
        e.preventDefault();
        setError('');
        setPlacing(true);
        try {
            const order = await api.checkout({ shipping, card });
            clearLocal();
            navigate(`/orders/${order.id}`, { state: { justPlaced: true } });
        } catch (err) {
            setError(err.message);
        } finally {
            setPlacing(false);
        }
    }

    if (items.length === 0) {
        return <div className="container"><p>Your cart is empty.</p></div>;
    }

    return (
        <div className="container checkout">
            <h1>Checkout</h1>
            <div className="checkout-grid">
                <form onSubmit={handlePlaceOrder} className="checkout-form">
                    <h2>Shipping details</h2>
                    <input required placeholder="Full name" value={shipping.name}
                        onChange={(e) => setShipping({ ...shipping, name: e.target.value })} />
                    <input required placeholder="Address" value={shipping.address}
                        onChange={(e) => setShipping({ ...shipping, address: e.target.value })} />
                    <div className="row-2">
                        <input required placeholder="City" value={shipping.city}
                            onChange={(e) => setShipping({ ...shipping, city: e.target.value })} />
                        <input required placeholder="ZIP / PIN code" value={shipping.zip}
                            onChange={(e) => setShipping({ ...shipping, zip: e.target.value })} />
                    </div>

                    <h2>Payment (sandbox mode)</h2>
                    <p className="hint">Test card: 4242 4242 4242 4242 · any future expiry · any CVC. Ending in 0002 = simulated decline.</p>
                    <input required placeholder="Card number" value={card.cardNumber}
                        onChange={(e) => setCard({ ...card, cardNumber: e.target.value })} />
                    <div className="row-2">
                        <input required placeholder="MM/YY" value={card.expiry}
                            onChange={(e) => setCard({ ...card, expiry: e.target.value })} />
                        <input required placeholder="CVC" value={card.cvc}
                            onChange={(e) => setCard({ ...card, cvc: e.target.value })} />
                    </div>

                    {error && <p className="error">{error}</p>}
                    <button className="btn" type="submit" disabled={placing}>
                        {placing ? 'Processing payment...' : `Pay ₹${total.toLocaleString('en-IN')}`}
                    </button>
                </form>

                <div className="order-summary">
                    <h2>Order summary</h2>
                    {items.map((item) => (
                        <div className="summary-row" key={item.cart_item_id}>
                            <span>{item.name} × {item.quantity}</span>
                            <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                    ))}
                    <div className="summary-row total-row">
                        <span>Total</span>
                        <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}