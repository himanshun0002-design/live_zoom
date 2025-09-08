import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    const handleLogin = () => {
        // Simplified login: just pass username to next page
        localStorage.setItem('username', username);
        navigate('/room');
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <input
                type="text"
                placeholder="Enter username"
                className="form-control mb-3"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <button className="btn btn-success" onClick={handleLogin}>
                Login
            </button>
        </div>
    );
}

export default Login;
