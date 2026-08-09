import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.getProduct(id).then(setProduct);
    }, [id]);

    if (!product) return <div className="container"><p>Loading...</p></div>;

    async function handleAdd() {
        if (!user) { navigate('/login'); return; }
        await addToCart(product.id, qty);
        navigate('/cart');
    }

    return (
        <div className="container product-detail">
            <img src={product.image_url} alt={product.name} />
            <div>
                <span className="category-tag">{product.category}</span>
                <h1>{product.name}</h1>
                <p className="description">{product.description}</p>
                <p className="price large">₹{product.price.toLocaleString('en-IN')}</p>
                <p className="stock-note">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                <div className="qty-row">
                    <label>Qty:</label>
                    <input
                        type="number"
                        min="1"
                        max={product.stock}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    />
                </div>
                <button className="btn" disabled={product.stock < 1} onClick={handleAdd}>
                    Add to cart
                </button>
            </div>
        </div>
    );
}