import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Home from './components/Home';
import Host from './components/Host';
import Guest from './components/Guest';
import KofiButton from './components/KofiButton';
import ThemeButton from './components/ThemeButton';
import InfoButton from './components/InfoButton';
import LangButton from './components/LangButton';
import { LanguageProvider } from './contexts/LanguageContext';

function App() {
    return (
        <LanguageProvider>
            <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/host/:roomId" element={<Host />} />
                <Route path="/join/:roomId" element={<Guest />} />
            </Routes>
            <ThemeButton />
            <KofiButton />
            <InfoButton />
            <LangButton />
            <Analytics />
        </BrowserRouter>
        </LanguageProvider>
    );
}

export default App;
