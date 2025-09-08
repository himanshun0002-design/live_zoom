import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Home.css';

import Header from './HomeSections/Header';
import Hero from './HomeSections/Hero';
import Features from './HomeSections/Features';
import MeetingActions from './HomeSections/MeetingActions';
import Footer from './HomeSections/Footer';

function Home() {
    const navigate = useNavigate();

    return (
        <div className="container">
            <Header navigate={navigate} />
            <Hero />
            <Features />
            <MeetingActions />
            <Footer />
        </div>
    );
}

export default Home;
