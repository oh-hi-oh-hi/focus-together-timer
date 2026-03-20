import React from 'react';
import './KofiButton.css';

const KofiButton = () => {
  return (
    <a
      href="https://ko-fi.com/oh_hi_oh_hi"
      target="_blank"
      rel="noopener noreferrer"
      className="kofi-floating-btn"
    >
      <div className="kofi-icon-container">
        <span className="kofi-icon">☕️</span>
      </div>
      <span className="kofi-text">개발자에게 커피 사주기 ☕️</span>
    </a>
  );
};

export default KofiButton;
