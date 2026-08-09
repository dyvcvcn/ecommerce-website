import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { api } from '../api';

export default function OrderDetail() {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);

    useEffect(() => {
        api.getOrder(id).then(setOrder);
    }, [id]);

    if (!order) return <div className="container"><p>Loading...</p></div>;

    return (
        <div className="container">
            {location.state?.justPlaced && (
                <div className="success-banner">✅ Payment successful — your order is confirmed!</div>
            )}
            <h1>Order #{order.id.slice(0, 8)}</h1>
            <p>Placed on {new Date(order.created_at).toLocaleString()}</p>
            <p>Status: <span className={`status-badge status-${order.status}`}>{order.status}</span></p>
            <p>Payment: {order.payment_status} ({order.payment_id})</p>

            <h2>Shipping to</h2>
            <p>{order.shipping_name}<br />{order.shipping_address}<br />{order.shipping_city} {order.shipping_zip}</p>

            <h2>Items</h2>
            <div className="order-list">
                {order.items.map((item) => (
                    <div className="summary-row" key={item.id}>
                        <span>{item.product_name} × {item.quantity}</span>
                        <span>₹{(item.unit_price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                ))}
                <div className="summary-row total-row">
                    <span>Total</span>
                    <span>₹{order.total.toLocaleString('en-IN')}</span>
                </div>
            </div>
        </div>
    );
}