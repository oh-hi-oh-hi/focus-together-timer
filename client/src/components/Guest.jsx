import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import TimerDisplay from './TimerDisplay';

function Guest() {
    const { roomId } = useParams();
    const navigate = useNavigate();

    const [hasPermission, setHasPermission] = useState(false);
    const [joined, setJoined] = useState(false);

    // Real-time states
    const [duration, setDuration] = useState(0);
    const [remaining, setRemaining] = useState(0);
    const [status, setStatus] = useState('waiting');
    const [endTime, setEndTime] = useState(null);
    const [errorMSG, setErrorMSG] = useState('');

    const alarmAudio = React.useRef(typeof Audio !== 'undefined' ? new Audio('/alarm.mp3') : null);

    // Play alarm when timer finishes
    useEffect(() => {
        if (status === 'finished' && alarmAudio.current) {
            alarmAudio.current.currentTime = 0;
            alarmAudio.current.play().catch(e => console.log('Audio play failed:', e));
        }
    }, [status]);

    // Handle joining when permission is granted
    const confirmJoin = () => {
        if (alarmAudio.current) {
            alarmAudio.current.play().then(() => {
                alarmAudio.current.pause();
                alarmAudio.current.currentTime = 0;
            }).catch(e => console.log('Audio unlock failed:', e));
        }

        setHasPermission(true);
        socket.emit('joinRoom', { roomId }, (response) => {
            if (response && response.error) {
                setErrorMSG(response.error);
            } else if (response && response.success) {
                setJoined(true);
                const { roomState } = response;
                setDuration(roomState.duration);
                setStatus(roomState.status);

                if (roomState.status === 'waiting') {
                    setRemaining(roomState.duration);
                } else if (roomState.status === 'paused') {
                    setRemaining(roomState.remaining);
                } else if (roomState.status === 'running') {
                    setEndTime(roomState.endTime);
                    const now = Date.now();
                    setRemaining(Math.max(0, Math.floor((roomState.endTime - now) / 1000)));
                }
            }
        });
    };

    useEffect(() => {
        const handleTimerUpdated = ({ duration: newDuration }) => {
            setDuration(newDuration);
            if (status === 'waiting') setRemaining(newDuration);
        };

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

        const handleRoomEnded = ({ message }) => {
            setErrorMSG(message);
            setStatus('finished');
        };

        const handleTimerReset = () => {
            setStatus('waiting');
            setEndTime(null);
            setRemaining(duration);
        };

        socket.on('timerUpdated', handleTimerUpdated);
        socket.on('timerStarted', handleTimerStarted);
        socket.on('timerPaused', handleTimerPaused);
        socket.on('timerResumed', handleTimerResumed);
        socket.on('timerReset', handleTimerReset);
        socket.on('roomEnded', handleRoomEnded);

        return () => {
            socket.off('timerUpdated', handleTimerUpdated);
            socket.off('timerStarted', handleTimerStarted);
            socket.off('timerPaused', handleTimerPaused);
            socket.off('timerResumed', handleTimerResumed);
            socket.off('timerReset', handleTimerReset);
            socket.off('roomEnded', handleRoomEnded);
        };
    }, [status, duration]);

    // Tick the timer matching the exact server end time
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


    if (errorMSG) {
        return (
            <div className="timer-container" style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#FF3B30' }}>오류 발생</h2>
                <p style={{ marginTop: '12px', color: '#AAA' }}>{errorMSG}</p>
                <button className="secondary" style={{ marginTop: '24px' }} onClick={() => navigate('/')}>홈으로</button>
            </div>
        );
    }

    // Permission Modal
    if (!hasPermission) {
        return (
            <div className="modal-overlay">
                <div className="modal">
                    <h2>타이머에 참여하시겠습니까?</h2>
                    <p>호스트가 시작하면 타이머가 자동으로 동기화됩니다.</p>
                    <div className="modal-actions">
                        <button className="secondary" onClick={() => navigate('/')}>취소</button>
                        <button onClick={confirmJoin}>승인</button>
                    </div>
                </div>
            </div>
        );
    }

    if (!joined) {
        return <div className="timer-container"><p>접속 중...</p></div>;
    }

    return (
        <div className="timer-container">
            {status === 'waiting' && (
                <div className="status-text" style={{ marginBottom: 'clamp(10px, 3vmin, 40px)', animation: 'fadeIn 1s infinite alternate' }}>
                    호스트가 시작하기를 기다리는 중...
                </div>
            )}
            {status === 'paused' && (
                <div className="status-text" style={{ marginBottom: 'clamp(10px, 3vmin, 40px)', color: '#FF9F0A', animation: 'fadeIn 1s infinite alternate' }}>
                    호스트가 타이머를 일시정지했습니다...
                </div>
            )}

            <TimerDisplay duration={duration} remaining={remaining} />

            {status === 'finished' && (
                <div style={{ marginTop: 'clamp(10px, 3vmin, 40px)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>
                    <div style={{ color: '#FF9F0A', fontSize: '1.5rem', fontWeight: 600 }}>
                        종료되었습니다!
                    </div>
                </div>
            )}
        </div>
    );
}

export default Guest;
