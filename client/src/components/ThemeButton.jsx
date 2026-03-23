import React, { useState, useEffect } from 'react';
import './ThemeButton.css';

const ThemeButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('mac');

  useEffect(() => {
    const savedTheme = localStorage.getItem('timerTheme');
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme) => {
    if (theme === 'mac') {
      document.body.removeAttribute('data-theme');
    } else {
      document.body.setAttribute('data-theme', theme);
    }
    window.dispatchEvent(new Event('themeChanged'));
  };

  const handleSelectTheme = (themeId) => {
    setCurrentTheme(themeId);
    applyTheme(themeId);
    localStorage.setItem('timerTheme', themeId);
    setIsOpen(false);
  };

  return (
    <>
      <div className="theme-floating-btn" onClick={() => setIsOpen(true)}>
        <div className="theme-icon-container">
          <span className="theme-icon" role="img" aria-label="theme">🎨</span>
        </div>
        <span className="theme-text">테마 변경하기</span>
      </div>

      {isOpen && (
        <div className="theme-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="theme-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="theme-modal-header">
              <h2>테마 선택 🎨</h2>
              <button className="theme-close-btn" onClick={() => setIsOpen(false)} aria-label="닫기">×</button>
            </div>

            <div className="theme-section">
              <div className="theme-list">
                <div 
                  className={`theme-item ${currentTheme === 'mac' ? 'active' : ''}`}
                  onClick={() => handleSelectTheme('mac')}
                >
                  <div className="theme-item-left">
                    <div className="theme-color-preview" style={{ background: '#000000', borderColor: '#FF9F0A' }}></div>
                    <span className="theme-name">기본 맥북 스타일 {currentTheme === 'mac' && '(현재)'}</span>
                  </div>
                </div>
                
                <div 
                  className={`theme-item ${currentTheme === 'monochrome' ? 'active' : ''}`}
                  onClick={() => handleSelectTheme('monochrome')}
                >
                  <div className="theme-item-left">
                    <div className="theme-color-preview" style={{ background: '#F8F9FA', borderColor: '#000000' }}></div>
                    <span className="theme-name">모노크롬 느와르 ♟️ {currentTheme === 'monochrome' && '(현재)'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThemeButton;
