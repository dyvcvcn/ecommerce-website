import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAdd }) {
    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`}>
                <img src={product.image_url} alt={product.name} loading="lazy" />
            </Link>
            <div className="product-card-body">
                <span className="category-tag">{product.category}</span>
                <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
                <div className="price-row">
                    <span className="price">₹{product.price.toLocaleString('en-IN')}</span>
                    <button
                        className="btn btn-small"
                        disabled={product.stock < 1}
                        onClick={() => onAdd(product.id)}
                    >
                        {product.stock < 1 ? 'Out of stock' : 'Add to cart'}
                    </button>
                </div>
            </div>
        </div>
    );
}