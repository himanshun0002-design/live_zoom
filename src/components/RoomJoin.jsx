import React, { useState } from 'react';
import VideoChat from './VideoChat';

function RoomJoin() {
    const [roomId, setRoomId] = useState('');
    const [joined, setJoined] = useState(false);

    return (
        <div className="container mt-5">
            {!joined ? (
                <div>
                    <input
                        type="text"
                        placeholder="Enter Room ID"
                        className="form-control mb-3"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={() => setJoined(true)}>
                        Join Room
                    </button>
                </div>
            ) : (
                <VideoChat roomId={roomId} />
            )}
        </div>
    );
}

export default RoomJoin;
