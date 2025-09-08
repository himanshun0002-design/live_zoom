import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:8000', {
    transports: ['websocket'],
});

function VideoChat({ roomId }) {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnection = useRef(null);

    useEffect(() => {
        peerConnection.current = new RTCPeerConnection();

        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then((stream) => {
                localVideoRef.current.srcObject = stream;
                stream.getTracks().forEach(track => peerConnection.current.addTrack(track, stream));
            });

        socket.emit('join-room', roomId);

        socket.on('offer', async (offer) => {
            await peerConnection.current.setRemoteDescription(offer);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            socket.emit('answer', answer, roomId);
        });

        socket.on('answer', async (answer) => {
            await peerConnection.current.setRemoteDescription(answer);
        });

        socket.on('ice-candidate', (candidate) => {
            peerConnection.current.addIceCandidate(candidate);
        });

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', event.candidate, roomId);
            }
        };

        peerConnection.current.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        return () => {
            peerConnection.current.close();
            socket.disconnect();
        };
    }, [roomId]);

    return (
        <div>
            <video ref={localVideoRef} autoPlay muted style={{ width: '300px' }} />
            <video ref={remoteVideoRef} autoPlay style={{ width: '300px' }} />
        </div>
    );
}

export default VideoChat;
