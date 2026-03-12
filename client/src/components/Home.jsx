import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function Home() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('생성 중...');

    const [joinCode, setJoinCode] = useState('');

    const createRoom = () => {
        setLoading(true);
        setLoadingMessage('생성 중...');

        // Render 무료 서버 콜드스타트(약 30~50초 소요)에 대비해
        // 1.5초 이상 방 생성이 지연되면 안내 메시지를 전환합니다.
        const wakeupTimer = setTimeout(() => {
            setLoadingMessage('서버를 깨우는 중입니다... (최대 1분 소요)');
        }, 1500);

        socket.emit('createRoom', { duration: 25 * 60 }, (response) => {
            clearTimeout(wakeupTimer);
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
                <button onClick={createRoom} disabled={loading} style={{ width: '100%', padding: '16px', fontSize: loading && loadingMessage.includes('소요') ? '0.9rem' : '1.2rem', transition: 'font-size 0.3s ease' }}>
                    {loading ? loadingMessage : '새 방 만들기'}
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
