import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="container auth-form">
            <h1>Create account</h1>
            <form onSubmit={handleSubmit}>
                <input required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <input required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input required type="password" placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="error">{error}</p>}
                <button className="btn" type="submit">Sign up</button>
            </form>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    );
}