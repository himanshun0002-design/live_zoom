import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import RoomJoin from './components/RoomJoin';
import Signup from './components/Signup';
import './components/Home.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/room" element={<RoomJoin />} />
                <Route path="/Signup" element={<Signup />} />
                <Route path="/room/:roomId" element={<RoomJoin />} />
            </Routes>
        </Router>
    );
}

export default App;
