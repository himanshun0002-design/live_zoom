import React from 'react';
import './Features.css';


function Features() {
    const features = [
        { 
            icon: 'fas fa-video', 
            title: 'HD Video', 
            desc: 'Experience crystal clear HD video quality with no lag, even with slow internet connections.' 
        },
        { 
            icon: 'fas fa-share-alt', 
            title: 'Screen Sharing', 
            desc: 'Share your entire screen or specific applications with meeting participants effortlessly.' 
        },
        { 
            icon: 'fas fa-lock', 
            title: 'Secure & Private', 
            desc: 'End-to-end encryption ensures your meetings remain private and secure from intruders.' 
        },
        { 
            icon: 'fas fa-record-vinyl', 
            title: 'Meeting Recording', 
            desc: 'Record your meetings with a single click and access them anytime for future reference.' 
        },
        { 
            icon: 'fas fa-comments', 
            title: 'Real-time Chat', 
            desc: 'Communicate via text during meetings with our intuitive chat system and file sharing.' 
        },
        { 
            icon: 'fas fa-users', 
            title: 'Collaboration Tools', 
            desc: 'Interactive whiteboard, annotations, and collaborative document editing for productive sessions.' 
        }
    ];

    return (
        <section className="features" id="features">
            <div className="container">
                <h2 className="section-title">Why Choose MeetEasy?</h2>
                <p className="section-subtitle">Experience the difference with our comprehensive set of features designed for seamless collaboration</p>
                
                <div className="feature-cards">
                    {features.map((feature, idx) => (
                        <div className="feature-card" key={idx}>
                            <div className="feature-icon">
                                <i className={feature.icon}></i>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;