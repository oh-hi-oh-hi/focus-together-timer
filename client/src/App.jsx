import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Host from './components/Host';
import Guest from './components/Guest';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/host/:roomId" element={<Host />} />
                <Route path="/join/:roomId" element={<Guest />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
