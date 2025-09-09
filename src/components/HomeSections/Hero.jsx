import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Hero.css';

function Hero() {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const handleScheduleClick = () => {
        setShowCalendar(true);
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
    };

    const handleConfirm = () => {
        alert(`Meeting scheduled for: ${selectedDate}`);
        setShowCalendar(false);
    };

    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Connect with Anyone, Anytime</h1>
                <p>MeetEasy provides crystal-clear video conferencing with screen sharing, recording, and real-time collaboration tools for productive meetings.</p>
                
                <div className="hero-buttons">
                    <button className="btn btn-primary btn-large" onClick={() => alert('Start Meeting clicked')}>
                        <i className="fas fa-video"></i> Start Meeting
                    </button>
                    <button className="btn btn-secondary btn-large" onClick={handleScheduleClick}>
                        <i className="fas fa-calendar-plus"></i> Schedule
                    </button>
                </div>

                {showCalendar && (
                    <div className="calendar-overlay">
                        <div className="calendar-popup">
                            <div className="popup-header">
                                <h3>Schedule a Meeting</h3>
                                <button className="close-btn" onClick={() => setShowCalendar(false)}>
                                    <i className="fas fa-times"></i>
                                </button>
                            </div>
                            <div className="popup-content">
                                <div className="datepicker-container">
                                    <label>Select Date & Time</label>
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={handleDateChange}
                                        showTimeSelect
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        dateFormat="MMMM d, yyyy h:mm aa"
                                        placeholderText="Choose date and time"
                                        minDate={new Date()}
                                        calendarClassName="meeteasy-calendar"
                                    />
                                </div>
                                <div className="selected-time">
                                    {selectedDate && (
                                        <p>Selected: {selectedDate.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                            <div className="popup-actions">
                                <button className="btn btn-cancel" onClick={() => setShowCalendar(false)}>
                                    Cancel
                                </button>
                                <button 
                                    className="btn btn-confirm" 
                                    onClick={handleConfirm} 
                                    disabled={!selectedDate}
                                >
                                    Schedule Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            
            {/* Decorative elements */}
            <div className="hero-decoration">
                <div className="decoration-circle"></div>
                <div className="decoration-circle"></div>
                <div className="decoration-circle"></div>
            </div>
        </section>
    );
}

export default Hero;