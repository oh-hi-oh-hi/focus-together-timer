import React, { useEffect, useRef, useState } from 'react';

function TimerDisplay({ duration, remaining }) {
    const canvasRef = useRef(null);
    const videoRef = useRef(null);
    const [isPipActive, setIsPipActive] = useState(false);

    // Update document title
    useEffect(() => {
        const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
        const secs = (remaining % 60).toString().padStart(2, '0');
        document.title = `${mins}:${secs} - 집중`;
    }, [remaining]);

    const percentage = duration > 0 ? (remaining / duration) : 0;
    const radius = 140; // For a 300x300 viewBox, center 150,150
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - percentage * circumference;

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (Math.floor(seconds) % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const theme = document.body.getAttribute('data-theme');
        const isMono = theme === 'monochrome';
        const bgColor = isMono ? '#F8F9FA' : '#000000';
        const ringBg = isMono ? '#E9ECEF' : '#333333';
        const accentColor = isMono ? '#000000' : '#FF9F0A';
        const textColor = isMono ? '#212529' : '#FFFFFF';

        ctx.clearRect(0, 0, 300, 300);
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, 300, 300);

        // Draw background circle
        ctx.beginPath();
        ctx.arc(150, 150, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = ringBg;
        ctx.lineWidth = 6;
        ctx.stroke();

        // Draw foreground circle
        if (percentage > 0) {
            ctx.beginPath();
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (percentage * 2 * Math.PI);
            ctx.arc(150, 150, radius, startAngle, endAngle, false);
            ctx.strokeStyle = accentColor;
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.stroke();
        }

        // Draw text
        ctx.fillStyle = textColor;
        ctx.font = '200 64px "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(formatTime(remaining), 150, 150);
    };

    // PIP Canvas Drawing
    useEffect(() => {
        drawCanvas();
        window.addEventListener('themeChanged', drawCanvas);
        return () => window.removeEventListener('themeChanged', drawCanvas);
    }, [remaining, duration, percentage, radius]);

    const togglePip = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
                setIsPipActive(false);
            } else if (document.webkitCurrentFullScreenElement || videoRef.current?.webkitPresentationMode === 'picture-in-picture') {
                videoRef.current?.webkitSetPresentationMode('inline');
                setIsPipActive(false);
            } else {
                const video = videoRef.current;
                const canvas = canvasRef.current;

                if (video && canvas) {
                    // Check if captureStream is supported
                    const getStream = canvas.captureStream || canvas.webkitCaptureStream || canvas.mozCaptureStream;
                    if (!getStream) {
                        alert('현재 브라우저 환경에서는 PIP 화면 캡처 기능을 지원하지 않습니다.\n크롬 호환 브라우저를 권장합니다!');
                        return;
                    }

                    if (!video.srcObject) {
                        const stream = getStream.call(canvas, 30);
                        video.srcObject = stream;
                        drawCanvas(); // 강제로 프레임 생성
                        await video.play().catch(console.error);
                    } else {
                        drawCanvas(); // 이미 스트림이 있어도 프레임 푸시
                    }

                    if (video.requestPictureInPicture) {
                        await video.requestPictureInPicture();
                        setIsPipActive(true);
                    } else if (video.webkitSupportsPresentationMode && video.webkitSupportsPresentationMode('picture-in-picture')) {
                        // Safari 지원
                        video.webkitSetPresentationMode('picture-in-picture');
                        setIsPipActive(true);
                    } else {
                        alert('이 브라우저에서는 기능(PIP)을 지원하지 않습니다.');
                        return;
                    }
                }
            }
        } catch (error) {
            console.error('PIP Error:', error);
            alert('PIP 기능을 실행할 수 없습니다.\n데스크탑 크롬, 엣지, 사파리를 이용해 주세요!');
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleLeavePIP = () => {
            setIsPipActive(false);
        };

        const handleWebKitPIPChange = () => {
            if (video.webkitPresentationMode !== 'picture-in-picture') {
                setIsPipActive(false);
            }
        };

        video.addEventListener('leavepictureinpicture', handleLeavePIP);
        video.addEventListener('webkitpresentationmodechanged', handleWebKitPIPChange);
        return () => {
            video.removeEventListener('leavepictureinpicture', handleLeavePIP);
            video.removeEventListener('webkitpresentationmodechanged', handleWebKitPIPChange);
        };
    }, []);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="timer-widget">
                <svg
                    className="timer-svg"
                    viewBox="0 0 300 300"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <circle
                        className="timer-circle-bg"
                        cx="150" cy="150" r={radius}
                    />
                    <circle
                        className="timer-circle-fg"
                        cx="150" cy="150" r={radius}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                <div
                    className="timer-text"
                    style={{ position: 'absolute', zIndex: 10 }}
                >
                    {formatTime(remaining)}
                </div>
            </div>

            {/* PIP Button - only show if browser potentially supports it */
                (document.pictureInPictureEnabled !== false) && (
                    <button
                        onClick={togglePip}
                        style={{
                            marginTop: 'clamp(8px, 2.5vmin, 30px)',
                            marginBottom: 'clamp(8px, 2.5vmin, 20px)',
                            backgroundColor: isPipActive ? '#333' : '#FF9F0A',
                            color: 'white',
                            border: 'none',
                            borderRadius: '999px',
                            padding: '12px 24px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: 600,
                            boxShadow: isPipActive ? 'none' : '0 4px 12px rgba(255, 159, 10, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {isPipActive ? 'PIP 끄기' : '플로팅 모드(PIP)'}
                    </button>
                )}

            {/* Hidden elements for PIP */}
            <canvas
                ref={canvasRef}
                width="300"
                height="300"
                style={{ display: 'none' }}
            />
            <video
                ref={videoRef}
                muted
                playsInline
                style={{ display: 'none' }}
            />
        </div>
    );
}

export default TimerDisplay;
