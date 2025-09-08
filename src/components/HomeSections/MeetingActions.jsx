import React from 'react';

function MeetingActions() {
    return (
        <section className="meeting-actions">
            <h2 className="section-title">Get Started Now</h2>
            <div className="action-cards">
                <div className="action-card">
                    <h3>New Meeting</h3>
                    <p>Start an instant meeting and invite participants with a simple link.</p>
                    <button className="btn" onClick={() => alert('New Meeting Clicked')}>
                        <i className="fas fa-plus"></i> Create Meeting
                    </button>
                </div>

                <div className="action-card">
                    <h3>Join Meeting</h3>
                    <p>Enter a meeting ID or code to join an existing meeting.</p>
                    <button className="btn" onClick={() => alert('Join Meeting Clicked')}>
                        <i className="fas fa-sign-in-alt"></i> Join Now
                    </button>
                </div>
            </div>
        </section>
    );
}

export default MeetingActions;
