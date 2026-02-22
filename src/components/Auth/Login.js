import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Trim inputs before sending to login
            const trimmedUsername = username.trim();
            const trimmedPassword = password.trim();

            const result = await login(trimmedUsername, trimmedPassword);
            if (result.success) {
                navigate('/dashboard');
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('ያልተለመደ ስህተት ተለለ። እባክዎ እንደገና ያስገቡ።'); // Amharic error message
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>ለሚ ኩራ ክፍለከተማ ወረዳ 06 አስተዳደር</h2>
                <form onSubmit={handleSubmit}>
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="username">የተጠቃሚ ስም</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="የተጠቃሚ ስም ያስገቡ"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">የይለፍ ቃል</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="የይለፍ ቃል ያስገቡ"
                        />
                    </div>

                    <button
                        type="submit"
                        className="login-btn"
                        disabled={loading}
                    >
                        {loading ? 'በመለስ ላይ...' : 'ግባ'}
                    </button>
                </form>


            </div>

            {/* Copyright */}
            <div className="copyright">
                <small>
                    © 2026 Version 1.0.0 - ELT Technology
                </small>
            </div>
        </div>
    );
};

export default Login;
