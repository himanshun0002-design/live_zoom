import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './MeetingRoom.css';

const SERVER_URL = 'http://localhost:8000';

function MeetingRoom() {
    const location = useLocation();
    const navigate = useNavigate();
    const { roomId, userId, userName } = location.state || {};

    const [users, setUsers] = useState([]);
    const [showNames, setShowNames] = useState(true);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);

    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const socketRef = useRef();
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const peersRef = useRef({});

    useEffect(() => {
        if (!roomId || !userId || !userName) {
            navigate('/room-join');
            return;
        }

        socketRef.current = io(SERVER_URL);

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localStreamRef.current = stream;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }

                socketRef.current.emit('join-room', roomId, { userId, userName });

                socketRef.current.on('all-users', (allUsers) => {
                    setUsers(allUsers);
                    allUsers.forEach(user => {
                        if (user.userId === userId) return;

                        const pc = createPeerConnection(user.userId);
                        stream.getTracks().forEach(track => pc.addTrack(track, stream));

                        peersRef.current[user.userId] = pc;
                    });
                });

                socketRef.current.on('user-connected', (newUser) => {
                    setUsers(prev => [...prev, newUser]);

                    const pc = createPeerConnection(newUser.userId);
                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    peersRef.current[newUser.userId] = pc;
                });

                socketRef.current.on('offer', async ({ sdp, caller }) => {
                    const pc = createPeerConnection(caller);

                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    socketRef.current.emit('answer', {
                        sdp: answer,
                        target: caller,
                        caller: userId
                    });

                    peersRef.current[caller] = pc;
                });

                socketRef.current.on('answer', async ({ sdp, caller }) => {
                    const pc = peersRef.current[caller];
                    if (pc) {
                        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
                    }
                });

                socketRef.current.on('ice-candidate', ({ candidate, from }) => {
                    const pc = peersRef.current[from];
                    if (pc && candidate) {
                        pc.addIceCandidate(new RTCIceCandidate(candidate));
                    }
                });

                socketRef.current.on('user-disconnected', (disconnectedUserId) => {
                    setUsers(prev => prev.filter(u => u.userId !== disconnectedUserId));

                    const pc = peersRef.current[disconnectedUserId];
                    if (pc) {
                        pc.close();
                        delete peersRef.current[disconnectedUserId];
                        delete remoteVideoRefs.current[disconnectedUserId];
                    }
                });
            })
            .catch(err => console.error('Error accessing media devices:', err));

        return () => {
            if (localStreamRef.current) {
                localStreamRef.current.getTracks().forEach(track => track.stop());
            }
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(track => track.stop());
            }

            Object.values(peersRef.current).forEach(pc => pc.close());
            socketRef.current.disconnect();
        };
    }, [roomId, userId, userName, navigate]);

    const createPeerConnection = (remoteUserId) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socketRef.current.emit('ice-candidate', {
                    candidate: event.candidate,
                    target: remoteUserId,
                    from: userId
                });
            }
        };

        pc.ontrack = (event) => {
            if (!remoteVideoRefs.current[remoteUserId]) {
                remoteVideoRefs.current[remoteUserId] = React.createRef();
            }

            if (remoteVideoRefs.current[remoteUserId].current) {
                remoteVideoRefs.current[remoteUserId].current.srcObject = event.streams[0];
            }
        };

        return pc;
    };

    const toggleAudio = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
            });
            setIsVideoOff(!isVideoOff);
        }
    };

    const toggleScreenShare = async () => {
        try {
            if (!isScreenSharing) {
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
                screenStreamRef.current = screenStream;

                const videoTrack = screenStream.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                });

                videoTrack.onended = toggleScreenShare;

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                setIsScreenSharing(true);
            } else {
                const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = cameraStream;

                const videoTrack = cameraStream.getVideoTracks()[0];
                Object.values(peersRef.current).forEach(pc => {
                    const sender = pc.getSenders().find(s => s.track.kind === 'video');
                    if (sender) sender.replaceTrack(videoTrack);
                });

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = cameraStream;
                }

                if (screenStreamRef.current) {
                    screenStreamRef.current.getTracks().forEach(track => track.stop());
                }

                setIsScreenSharing(false);
            }
        } catch (err) {
            console.error('Error toggling screen share:', err);
        }
    };

    const leaveMeeting = () => {
        window.location.href = '/';
    };

    // Get initials for avatar
    const getInitials = (name) => {
        return name.split(' ').map(word => word[0]).join('').toUpperCase();
    };

    return (
        <div className="meeting-room">
            <aside className="sidebar">
                <div className="meeting-info">
                    <h2><i className="fas fa-video"></i> Team Meeting</h2>
                    <p>Design Review Session</p>
                    <div className="meeting-id">
                        <span>ID: {roomId}</span>
                        <button title="Copy meeting ID">
                            <i className="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                
                <div className="participants-section">
                    <div className="participants-header">
                        <h3>Participants ({users.length})</h3>
                        <button 
                            className="toggle-names"
                            onClick={() => setShowNames(!showNames)}
                        >
                            {showNames ? 'Hide Names' : 'Show Names'}
                        </button>
                    </div>
                    
                    <ul className="participants-list">
                        {users.map(user => (
                            <li key={user.userId} className="participant-item">
                                <div className="participant-avatar">
                                    {getInitials(user.userName)}
                                </div>
                                <div className="participant-details">
                                    <div className="participant-name">
                                        {showNames ? user.userName : `User ${user.userId.slice(0,5)}`}
                                        {user.userId === userId && <span className="participant-you">(You)</span>}
                                    </div>
                                    <div className="participant-status">
                                        <div className={`status-indicator ${isAudioMuted ? 'muted' : ''}`}></div>
                                        <span>
                                            {user.userId === userId 
                                                ? (isAudioMuted ? 'Muted' : 'Connected') 
                                                : 'Connected'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </aside>
            
            <main className="main-content">
                <div className="video-grid">
                    {users.filter(u => u.userId !== userId).map(user => (
                        <div key={user.userId} className="video-item">
                            <video
                                ref={remoteVideoRefs.current[user.userId] || (remoteVideoRefs.current[user.userId] = React.createRef())}
                                autoPlay
                                playsInline
                            />
                            <div className="video-info">
                                <div className="video-indicator"></div>
                                {showNames && <div className="video-name">{user.userName}</div>}
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="local-video-container">
                    <video 
                        ref={localVideoRef} 
                        autoPlay 
                        muted 
                        playsInline 
                        className={isVideoOff ? 'video-off' : ''} 
                    />
                    {isVideoOff && <div className="video-placeholder">Camera Off</div>}
                    <div className="video-info">
                        <div className={`video-indicator ${isAudioMuted ? 'muted' : ''}`}></div>
                        <div className="video-name">You</div>
                    </div>
                </div>
                
                <div className="meeting-controls">
                    <button 
                        className={`control-btn control-mic ${isAudioMuted ? 'muted' : ''}`}
                        onClick={toggleAudio}
                        title={isAudioMuted ? 'Unmute' : 'Mute'}
                    >
                        <i className={`fas ${isAudioMuted ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
                    </button>
                    <button 
                        className={`control-btn control-video ${isVideoOff ? 'off' : ''}`}
                        onClick={toggleVideo}
                        title={isVideoOff ? 'Start Video' : 'Stop Video'}
                    >
                        <i className={`fas ${isVideoOff ? 'fa-video-slash' : 'fa-video'}`}></i>
                    </button>
                    <button 
                        className={`control-btn control-screen ${isScreenSharing ? 'active' : ''}`}
                        onClick={toggleScreenShare}
                        title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
                    >
                        <i className="fas fa-desktop"></i>
                    </button>
                    <button 
                        className="control-btn control-leave"
                        onClick={leaveMeeting}
                        title="Leave Meeting"
                    >
                        <i className="fas fa-phone-slash"></i>
                    </button>
                </div>
            </main>
        </div>
    );
}

export default MeetingRoom;