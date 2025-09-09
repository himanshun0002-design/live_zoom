import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './VideoChat.css';

const socket = io('http://localhost:8000', { transports: ['websocket'] });

function VideoChat({ roomId }) {
    const localVideoRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const [stream, setStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const peerConnections = useRef({}); // Track multiple peers

    useEffect(() => {
        const init = async () => {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                setStream(mediaStream);
                localVideoRef.current.srcObject = mediaStream;

                socket.emit('join-room', roomId);

                socket.on('user-joined', userId => {
                    const pc = createPeerConnection(userId, mediaStream);
                    peerConnections.current[userId] = pc;

                    pc.createOffer()
                        .then(offer => pc.setLocalDescription(offer))
                        .then(() => {
                            socket.emit('offer', { offer: pc.localDescription, to: userId });
                        });
                });

                socket.on('offer', async ({ offer, from }) => {
                    const pc = createPeerConnection(from, mediaStream);
                    peerConnections.current[from] = pc;

                    await pc.setRemoteDescription(offer);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('answer', { answer, to: from });
                });

                socket.on('answer', async ({ answer, from }) => {
                    const pc = peerConnections.current[from];
                    if (pc) await pc.setRemoteDescription(answer);
                });

                socket.on('ice-candidate', ({ candidate, from }) => {
                    const pc = peerConnections.current[from];
                    if (pc && candidate) pc.addIceCandidate(candidate);
                });

                socket.on('user-left', userId => {
                    const pc = peerConnections.current[userId];
                    if (pc) {
                        pc.close();
                        delete peerConnections.current[userId];
                        setRemoteStreams(prev => prev.filter(s => s.userId !== userId));
                    }
                });
            } catch (err) {
                console.error('Error accessing media devices:', err);
            }
        };

        init();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
            Object.values(peerConnections.current).forEach(pc => pc.close());
            socket.disconnect();
        };
    }, [roomId]);

    function createPeerConnection(userId, mediaStream) {
        const pc = new RTCPeerConnection();

        mediaStream.getTracks().forEach(track => pc.addTrack(track, mediaStream));

        pc.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: userId });
            }
        };

        pc.ontrack = event => {
            setRemoteStreams(prev => {
                if (!prev.some(s => s.userId === userId)) {
                    return [...prev, { userId, stream: event.streams[0] }];
                }
                return prev;
            });
        };

        return pc;
    }

    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    };

    return (
        <div className="video-chat-wrapper">
            <div className="local-video">
                <video ref={localVideoRef} autoPlay muted playsInline />
                <span>You</span>
            </div>

            <div className="controls">
                <button className={`control-btn ${isMuted ? 'active' : ''}`} onClick={toggleMute}>
                    {isMuted ? 'Unmute Mic' : 'Mute Mic'}
                </button>
                <button className={`control-btn ${isVideoOff ? 'active' : ''}`} onClick={toggleVideo}>
                    {isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
                </button>
            </div>

            <div className="remote-videos">
                {remoteStreams.map(r => (
                    <div className="remote-video" key={r.userId}>
                        <video autoPlay playsInline ref={el => el && (el.srcObject = r.stream)} />
                        <span>User</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default VideoChat;
