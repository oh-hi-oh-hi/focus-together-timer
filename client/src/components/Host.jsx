import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Minus, Plus, Play, Pause, AlertCircle, Share2, Users } from 'lucide-react';
import { socket } from '../socket';
import TimerDisplay from './TimerDisplay';
import { useLanguage } from '../contexts/LanguageContext';

function Host() {
    const { t } = useLanguage();
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [roomState, setRoomState] = useState(null);
    const [error, setError] = useState('');

    // Real-time states
    const [duration, setDuration] = useState(25 * 60);
    const [remaining, setRemaining] = useState(25 * 60);
    const [status, setStatus] = useState('waiting');
    const [endTime, setEndTime] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [userCount, setUserCount] = useState(1);

    const alarmAudio = React.useRef(typeof Audio !== 'undefined' ? new Audio('/alarm.mp3') : null);

    // Play alarm when timer finishes
    useEffect(() => {
        if (status === 'finished' && alarmAudio.current) {
            alarmAudio.current.currentTime = 0;
            alarmAudio.current.play().catch(e => console.log('Audio play failed:', e));
        }
    }, [status]);

    useEffect(() => {
        // Initial fetch/creation if needed. 
        // Usually host comes here via creation, so socket should re-create if refreshed,
        // but simplified: we just emit "createRoom" with same id or fetch wait.
        // Actually, in our strict user flow, host created the room then navigated here.
        // If they refresh, they will lose host status unless backend is modified.
        // Assuming no page refresh for the sake of simplicity.

        // Listeners
        const handleParticipantJoined = (data) => console.log('Participant joined:', data);
        const handleTimerStarted = ({ endTime: newEndTime, duration: newDuration }) => {
            setStatus('running');
            setEndTime(newEndTime);
            setDuration(newDuration);
        };
        const handleTimerPaused = ({ remaining: newRemaining }) => {
            setStatus('paused');
            setRemaining(newRemaining);
            setEndTime(null);
        };
        const handleTimerResumed = ({ endTime: newEndTime, remaining: newRemaining }) => {
            setStatus('running');
            setEndTime(newEndTime);
            setRemaining(newRemaining);
        };
        const handleTimerReset = () => {
            setStatus('waiting');
            setEndTime(null);
            setRemaining(duration);
        };
        const handleUserCountUpdated = ({ count }) => {
            setUserCount(count);
        };

        socket.on('participantJoined', handleParticipantJoined);
        socket.on('timerStarted', handleTimerStarted);
        socket.on('timerPaused', handleTimerPaused);
        socket.on('timerResumed', handleTimerResumed);
        socket.on('timerReset', handleTimerReset);
        socket.on('userCountUpdated', handleUserCountUpdated);

        return () => {
            socket.off('participantJoined', handleParticipantJoined);
            socket.off('timerStarted', handleTimerStarted);
            socket.off('timerPaused', handleTimerPaused);
            socket.off('timerResumed', handleTimerResumed);
            socket.off('timerReset', handleTimerReset);
            socket.off('userCountUpdated', handleUserCountUpdated);
        };
    }, [duration]);

    // Update backend whenever host changes duration in "waiting" state
    useEffect(() => {
        if (status === 'waiting') {
            socket.emit('updateTimer', { roomId, duration });
            setRemaining(duration);
        }
    }, [duration, roomId, status]);

    // Tick the timer
    useEffect(() => {
        let interval;
        if (status === 'running' && endTime) {
            interval = setInterval(() => {
                const now = Date.now();
                const diff = Math.max(0, Math.floor((endTime - now) / 1000));
                setRemaining(diff);
                if (diff <= 0) {
                    setStatus('finished');
                    clearInterval(interval);
                }
            }, 100);
        }
        return () => clearInterval(interval);
    }, [status, endTime]);

    const changeTime = (deltaMinutes) => {
        if (status === 'waiting') {
            setDuration(prev => Math.max(60, prev + deltaMinutes * 60));
        }
    };

    const handleManualTimeInput = (e) => {
        let val = parseInt(e.target.value, 10);
        if (isNaN(val) || val < 1) val = 1; // minimum 1 minute
        if (val > 999) val = 999;
        setDuration(val * 60);
    };

    const startTimer = () => {
        if (alarmAudio.current) {
            alarmAudio.current.play().then(() => {
                alarmAudio.current.pause();
                alarmAudio.current.currentTime = 0;
            }).catch(e => console.log('Audio unlock failed:', e));
        }
        socket.emit('startTimer', { roomId });
    };

    const pauseTimer = () => {
        socket.emit('pauseTimer', { roomId, remaining });
    };

    const resumeTimer = () => {
        socket.emit('resumeTimer', { roomId });
    };

    const resetTimer = () => {
        socket.emit('resetTimer', { roomId });
    };

    const handleShare = () => {
        const url = window.location.origin;
        const appText = `Focus Together Timer\n방 코드: ${roomId}\n접속 주소: ${url}`;
        navigator.clipboard.writeText(appText)
            .then(() => {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
            })
            .catch(err => {
                console.error("클립보드 복사 실패:", err);
            });
    };

    return (
        <div className="setup-container">
            <div className="room-code-container">
                <p className="room-code-label">{t('host.codeLabel')}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="room-code-box">
                        <h2 className="room-code-text">{roomId}</h2>
                    </div>
                    <button
                        onClick={handleShare}
                        className="share-btn"
                        title={t('host.copyTitle')}
                    >
                        <Share2 size={24} color="white" />
                    </button>
                </div>
                <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#AAA', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Users size={16} />
                    {t('host.usersOnline', { count: userCount })}
                </div>
            </div>

            <TimerDisplay duration={duration} remaining={remaining} />

            {status === 'waiting' && (
                <div className="time-setup">
                    <button className="time-btn" onClick={() => changeTime(-1)}>
                        <Minus size={24} color="white" />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input
                            type="number"
                            value={Math.floor(duration / 60)}
                            onChange={handleManualTimeInput}
                            style={{
                                width: 'clamp(40px, 10vw, 60px)',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'var(--text-color)',
                                fontSize: 'clamp(1.1rem, 3.5vw, 1.2rem)',
                                fontWeight: 500,
                                textAlign: 'center',
                                outline: 'none'
                            }}
                        />
                        <span style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.2rem)', fontWeight: 500 }}>{t('host.minute')}</span>
                    </div>
                    <button className="time-btn" onClick={() => changeTime(1)}>
                        <Plus size={24} color="white" />
                    </button>
                </div>
            )}

            {status === 'waiting' && (
                <button onClick={startTimer} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'clamp(5px, 2.5vmin, 20px)' }}>
                    <Play fill="white" size={20} />
                    {t('host.startBtn')}
                </button>
            )}

            {status === 'running' && (
                <button onClick={pauseTimer} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'clamp(5px, 2.5vmin, 20px)', backgroundColor: '#333' }}>
                    <Pause fill="white" size={20} />
                    {t('host.pauseBtn')}
                </button>
            )}

            {status === 'paused' && (
                <button onClick={resumeTimer} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'clamp(5px, 2.5vmin, 20px)' }}>
                    <Play fill="white" size={20} />
                    {t('host.resumeBtn')}
                </button>
            )}

            {status === 'finished' && (
                <div style={{ marginTop: 'clamp(5px, 2.5vmin, 20px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    <div style={{ color: '#FF9F0A', fontSize: '1.5rem', fontWeight: 600 }}>
                        {t('host.finished')}
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={resetTimer} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Play fill="white" size={20} />
                            {t('host.resetBtn')}
                        </button>
                        <button className="secondary" onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {t('host.homeBtn')}
                        </button>
                    </div>
                </div>
            )}
            {showToast && (
                <div className="toast-notification">
                    {t('host.toast')}
                </div>
            )}
        </div>
    );
}

export default Host;
