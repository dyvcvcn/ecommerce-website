import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) { navigate('/login'); return; }
        api.getOrders().then(setOrders).finally(() => setLoading(false));
    }, [user]);

    if (loading) return <div className="container"><p>Loading orders...</p></div>;

    return (
        <div className="container">
            <h1>Order History</h1>
            {orders.length === 0 ? (
                <p>No orders yet. <Link to="/">Start shopping</Link></p>
            ) : (
                <div className="order-list">
                    {orders.map((o) => (
                        <Link to={`/orders/${o.id}`} className="order-row" key={o.id}>
                            <div>
                                <span className="order-id">Order #{o.id.slice(0, 8)}</span>
                                <span className="order-date">{new Date(o.created_at).toLocaleString()}</span>
                            </div>
                            <span className={`status-badge status-${o.status}`}>{o.status}</span>
                            <span className="price">₹{o.total.toLocaleString('en-IN')}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}