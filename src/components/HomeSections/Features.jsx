import React from 'react';

function Features() {
    return (
        <section className="features" id="features">
            <h2 className="section-title">Why Choose MeetEasy?</h2>
            <div className="feature-cards">
                {[
                    { icon: 'fas fa-video', title: 'HD Video', desc: 'Experience crystal clear HD video quality with no lag, even with slow internet connections.' },
                    { icon: 'fas fa-share-alt', title: 'Screen Sharing', desc: 'Share your entire screen or specific applications with meeting participants effortlessly.' },
                    { icon: 'fas fa-lock', title: 'Secure & Private', desc: 'End-to-end encryption ensures your meetings remain private and secure from intruders.' }
                ].map((feature, idx) => (
                    <div className="feature-card" key={idx}>
                        <div className="feature-icon">
                            <i className={feature.icon}></i>
                        </div>
                        <h3>{feature.title}</h3>
                        <p>{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Features;
