import React from 'react';
import { Link } from 'react-router-dom';

function Header({ navigate }) {
    return (
        <header>
            <div className="logo">
                <i className="fas fa-video"></i>
                <h1>MeetEasy</h1>
            </div>

            <div className="nav-links">
                <Link to="/">Home</Link>
                <a href="#features">Features</a>
                <a href="#pricing">Pricing</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </div>

            <div className="auth-buttons">
                <button className="btn btn-outline" onClick={() => navigate('/login')}>
                    Sign In
                </button>
                <button className="btn btn-primary" onClick={() => alert('Redirect to Sign Up')}>
                    Sign Up
                </button>
            </div>
        </header>
    );
}

export default Header;
