import React, { useState } from 'react';
import './Login.css'; // We'll move all your CSS here
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { FaGoogle, FaFacebookF, FaApple } from 'react-icons/fa';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = () => {
        if (!username) return alert('Please enter your username');
        if (!password) return alert('Please enter your password');

        setLoading(true);

        setTimeout(() => {
            alert('Login successful! Redirecting to meeting room...');
            setLoading(false);
            navigate('/room'); // Redirect to room
        }, 1500);
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="app-logo">
                    <FaVideo size={32} />
                    <h1>MeetEasy</h1>
                </div>

                <h2 className="login-title">Welcome Back!</h2>
                <p className="login-subtitle">
                    Sign in to join your meeting or schedule a new one
                </p>

                <div className="input-group">
                    <FaUser className="input-icon" />
                    <input
                        type="text"
                        placeholder="Username or Email"
                        className="login-input"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <FaLock className="input-icon" />
                    <input
                        type="password"
                        placeholder="Password"
                        className="login-input"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button className="login-btn" onClick={handleLogin} disabled={loading}>
                    {loading ? <i className="fas fa-spinner fa-spin"></i> : <FaSignInAlt />}
                    {loading ? ' Signing In...' : ' Sign In'}
                </button>

                <div className="divider">
                    <div className="divider-line"></div>
                    <div className="divider-text">or continue with</div>
                    <div className="divider-line"></div>
                </div>

                <div className="social-login">
                    <div className="social-btn google"><FaGoogle /></div>
                    <div className="social-btn facebook"><FaFacebookF /></div>
                    <div className="social-btn apple"><FaApple /></div>
                </div>

                <div className="signup-link">
                    Don't have an account?
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => navigate('/signup')}
                    >
                        Sign up
                    </button>
                </div>

            </div>
        </div>
    );
}

export default Login;
