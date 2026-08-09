import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { count } = useCart();
    const navigate = useNavigate();

    function handleLogout() {
        logout();
        navigate('/');
    }

    return (
        <nav className="navbar">
            <Link to="/" className="brand">ShopSphere</Link>
            <div className="nav-links">
                <Link to="/">Shop</Link>
                <Link to="/cart">Cart{count > 0 ? ` (${count})` : ''}</Link>
                {user && <Link to="/orders">Orders</Link>}
                {user ? (
                    <>
                        <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
                        <button className="link-btn" onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Sign Up</Link>
                    </>
                )}
            </div>
        </nav>
    );
}