import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="container auth-form">
            <h1>Log in</h1>
            <form onSubmit={handleSubmit}>
                <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="error">{error}</p>}
                <button className="btn" type="submit">Log in</button>
            </form>
            <p>No account? <Link to="/register">Sign up</Link></p>
        </div>
    );
}