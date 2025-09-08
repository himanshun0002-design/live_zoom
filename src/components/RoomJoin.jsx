import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaVideo, FaSignInAlt, FaMicrophone, FaPhoneSlash, FaMicrophoneSlash, FaVideoSlash } from "react-icons/fa";
import "./RoomJoin.css";

function RoomJoin() {
    const { roomId: urlRoomId } = useParams();
    const navigate = useNavigate();
    const videoRef = useRef();
    
    const [roomId, setRoomId] = useState(urlRoomId || "");
    const [inRoom, setInRoom] = useState(false);
    const [currentRoomId, setCurrentRoomId] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [devices, setDevices] = useState({ audio: [], video: [] });
    const [selectedDevices, setSelectedDevices] = useState({ audio: "", video: "" });
    const [stream, setStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);

    const initializeStream = useCallback(async () => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: selectedDevices.audio ? { deviceId: { exact: selectedDevices.audio } } : true,
                video: selectedDevices.video ? { deviceId: { exact: selectedDevices.video } } : true
            });

            setStream(mediaStream);
            return mediaStream;
        } catch (err) {
            setError("Failed to access media devices. Please ensure you have given permission.");
            console.error("Error accessing media:", err);
            return null;
        }
    }, [stream, selectedDevices]);

    const generateRoomId = useCallback(() => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let id = "";
        for (let i = 0; i < 4; i++) id += letters.charAt(Math.floor(Math.random() * letters.length));
        id += "-";
        for (let i = 0; i < 4; i++) id += numbers.charAt(Math.floor(Math.random() * numbers.length));
        return id;
    }, []);

    const joinRoom = useCallback(async () => {
        if (!roomId.trim()) {
            setError("Please enter a Room ID");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const mediaStream = await initializeStream();
            if (!mediaStream) {
                setLoading(false);
                return;
            }

            setCurrentRoomId(roomId);
            setInRoom(true);
            navigate(`/room/${roomId}`, { replace: true });
        } catch (err) {
            setError("Failed to join room. Please try again.");
            console.error("Error joining room:", err);
        } finally {
            setLoading(false);
        }
    }, [roomId, navigate, initializeStream]);

    const createRoom = useCallback(async () => {
        const newRoomId = generateRoomId();
        setRoomId(newRoomId);
        await joinRoom();
    }, [generateRoomId, joinRoom]);

    const leaveRoom = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setRoomId("");
        setInRoom(false);
        setError("");
        navigate("/");
    }, [stream, navigate]);

    const toggleMute = useCallback(() => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, [stream]);

    const toggleVideo = useCallback(() => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
            }
        }
    }, [stream]);

    useEffect(() => {
        const getDevices = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                setDevices({
                    audio: devices.filter(device => device.kind === "audioinput"),
                    video: devices.filter(device => device.kind === "videoinput")
                });
            } catch (err) {
                setError("Failed to get media devices");
                console.error("Error getting devices:", err);
            }
        };

        getDevices();

        if (urlRoomId) {
            joinRoom();
        }

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [urlRoomId, joinRoom, stream]);

    useEffect(() => {
        if (stream && videoRef.current) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    return (
        <div className="join-room-container">
            {error && <div className="error-message">{error}</div>}

            <div className="video-preview">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                />
            </div>

            <div className="device-controls">
                <select
                    className="select-device"
                    value={selectedDevices.audio}
                    onChange={(e) => setSelectedDevices(prev => ({ ...prev, audio: e.target.value }))}
                >
                    <option value="">Default Microphone</option>
                    {devices.audio.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                        </option>
                    ))}
                </select>

                <select
                    className="select-device"
                    value={selectedDevices.video}
                    onChange={(e) => setSelectedDevices(prev => ({ ...prev, video: e.target.value }))}
                >
                    <option value="">Default Camera</option>
                    {devices.video.map(device => (
                        <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${device.deviceId.slice(0, 5)}...`}
                        </option>
                    ))}
                </select>
            </div>

            <div className="control-buttons">
                <button
                    className={`control-button ${isMuted ? "active" : ""}`}
                    onClick={toggleMute}
                    title={isMuted ? "Unmute" : "Mute"}
                >
                    {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
                </button>
                <button
                    className={`control-button ${isVideoOff ? "active" : ""}`}
                    onClick={toggleVideo}
                    title={isVideoOff ? "Start Video" : "Stop Video"}
                >
                    {isVideoOff ? <FaVideoSlash /> : <FaVideo />}
                </button>
            </div>

            {!inRoom ? (
                <div className="room-form">
                    <input
                        type="text"
                        className="room-input"
                        placeholder="Enter Room ID"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button
                        className="room-button"
                        onClick={joinRoom}
                        disabled={loading}
                    >
                        <FaSignInAlt /> Join Room
                    </button>
                    <button
                        className="room-button"
                        onClick={createRoom}
                        disabled={loading}
                    >
                        <FaVideo /> Create New Room
                    </button>
                </div>
            ) : (
                <div className="room-form">
                    <p>Current Room: {currentRoomId}</p>
                    <button
                        className="room-button"
                        onClick={leaveRoom}
                    >
                        <FaPhoneSlash /> Leave Room
                    </button>
                </div>
            )}

            {loading && (
                <div className="loading">
                    Connecting to room...
                </div>
            )}
        </div>
    );
}

export default RoomJoin;
