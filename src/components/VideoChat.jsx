import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import './VideoChat.css';

const socket = io('http://localhost:8000', { transports: ['websocket'] });

function VideoChat({ roomId }) {
    const localVideoRef = useRef(null);
    const [remoteStreams, setRemoteStreams] = useState([]);
    const peerConnections = useRef({}); // Track multiple peers

    useEffect(() => {
        // Get user media
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(stream => {
                localVideoRef.current.srcObject = stream;

                socket.emit('join-room', roomId);

                socket.on('user-joined', userId => {
                    const pc = createPeerConnection(userId, stream);
                    peerConnections.current[userId] = pc;

                    // Create offer
                    pc.createOffer()
                        .then(offer => pc.setLocalDescription(offer))
                        .then(() => {
                            socket.emit('offer', { offer: pc.localDescription, to: userId });
                        });
                });

                socket.on('offer', async ({ offer, from }) => {
                    const pc = createPeerConnection(from, stream);
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
            });

        // Cleanup on unmount
        return () => {
            Object.values(peerConnections.current).forEach(pc => pc.close());
            socket.disconnect();
        };
    }, [roomId]);

    function createPeerConnection(userId, stream) {
        const pc = new RTCPeerConnection();

        // Add tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // ICE candidates
        pc.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, to: userId });
            }
        };

        // Remote tracks
        pc.ontrack = event => {
            setRemoteStreams(prev => {
                // Avoid duplicates
                if (!prev.some(s => s.userId === userId)) {
                    return [...prev, { userId, stream: event.streams[0] }];
                }
                return prev;
            });
        };

        return pc;
    }

    return (
        <div className="video-chat-wrapper">
            <div className="local-video">
                <video ref={localVideoRef} autoPlay muted playsInline />
                <span>You</span>
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
