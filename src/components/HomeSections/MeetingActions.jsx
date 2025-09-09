import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid'; // For unique Room IDs

function MeetingActions() {
    const navigate = useNavigate();
    const [joinRoomId, setJoinRoomId] = useState('');

    const handleCreateMeeting = () => {
        navigate(`/room`);
    };

    const handleJoinMeeting = () => {
        if (!joinRoomId.trim()) {
            alert('Please enter a valid Room ID to join');
            return;
        }
        navigate(`/`);
    };

    return (
        <section className="meeting-actions">
            <h2 className="section-title">Get Started Now</h2>

            <div className="action-cards">

                <div className="action-card">
                    <h3>New Meeting</h3>
                    <p>Start an instant meeting and invite participants with a unique link.</p>
                    <button className="btn" onClick={handleCreateMeeting}>
                        <i className="fas fa-plus"></i> Create Meeting
                    </button>
                </div>

                <div className="action-card">
                    <h3>Join Meeting</h3>
                    <p>Enter a meeting ID or code to join an existing meeting.</p>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        value={joinRoomId}
                        onChange={(e) => setJoinRoomId(e.target.value)}
                        className="room-input"
                    />
                    <button className="btn" onClick={handleJoinMeeting}>
                        <i className="fas fa-sign-in-alt"></i> Join Now
                    </button>
                </div>

            </div>
        </section>
    );
}

export default MeetingActions;
