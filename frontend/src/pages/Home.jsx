import { useEffect, useState } from 'react';
import { api } from '../api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        api.getCategories().then(setCategories).catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (search) params.search = search;
        if (category) params.category = category;
        api.getProducts(params).then(setProducts).finally(() => setLoading(false));
    }, [search, category]);

    async function handleAdd(productId) {
        if (!user) { navigate('/login'); return; }
        await addToCart(productId, 1);
        setMessage('Added to cart!');
        setTimeout(() => setMessage(''), 1500);
    }

    return (
        <div className="container">
            <div className="hero">
                <h1>Everything you need, in one storefront.</h1>
                <p>Browse the catalog, add to cart, and check out with our sandbox payment gateway — no real charges, ever.</p>
            </div>

            <div className="filter-bar">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">All categories</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {message && <div className="toast">{message}</div>}

            {loading ? (
                <p>Loading products...</p>
            ) : products.length === 0 ? (
                <p>No products found.</p>
            ) : (
                <div className="product-grid">
                    {products.map((p) => (
                        <ProductCard key={p.id} product={p} onAdd={handleAdd} />
                    ))}
                </div>
            )}
        </div>
    );
}