import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [joinCode, setJoinCode] = useState('');

    const createRoom = () => {
        setLoading(true);
        socket.emit('createRoom', { duration: 25 * 60 }, (response) => {
            setLoading(false);
            if (response && response.roomId) {
                navigate(`/host/${response.roomId}`);
            } else {
                alert('방 생성에 실패했습니다.');
            }
        });
    };

    const joinRoom = () => {
        if (!joinCode.trim()) return;
        navigate(`/join/${joinCode.trim().toUpperCase()}`);
    };

    return (
        <div className="auth-container">
            <h1 className="hero-title">Timer Together</h1>
            <p className="hero-subtitle">Mac OS Vibe Real-time Synchronized Timer</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
                <button onClick={createRoom} disabled={loading} style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
                    {loading ? '생성 중...' : '새 방 만들기'}
                </button>

                <div style={{ width: '100%', height: '1px', backgroundColor: '#333', margin: '10px 0' }}></div>

                <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
                    <input
                        type="text"
                        placeholder="방 코드 입력"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                        style={{ flex: 1, padding: '16px', borderRadius: '12px', border: '1px solid #333', backgroundColor: '#111', color: 'white', fontSize: '1rem', outline: 'none', textAlign: 'center', textTransform: 'uppercase' }}
                    />
                </div>
                <button className="secondary" onClick={joinRoom} style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
                    참여하기
                </button>
            </div>
        </div>
    );
}

export default Home;
