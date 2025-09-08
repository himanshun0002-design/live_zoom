import React from 'react';


function Hero() {
    return (
        <section className="hero">
            <div className="hero-content">
                <h2>Connect with Anyone, Anytime</h2>
                <p>MeetEasy provides crystal-clear video conferencing with screen sharing, recording, and real-time collaboration tools for productive meetings.</p>
                <div className="hero-buttons">
                    <button className="btn btn-primary btn-large" onClick={() => alert('Start Meeting clicked')}>
                        <i className="fas fa-play-circle"></i> Start Meeting
                    </button>
                    <button className="btn btn-outline btn-large" onClick={() => alert('Schedule clicked')}>
                        <i className="fas fa-calendar-plus"></i> Schedule
                    </button>
                </div>
            </div>
        </section>
    );
}

export default Hero;
