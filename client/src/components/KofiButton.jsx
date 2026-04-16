import React from 'react';
import './KofiButton.css';
import { useLanguage } from '../contexts/LanguageContext';

const KofiButton = () => {
  const { t } = useLanguage();
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
      <span className="kofi-text">{t('kofi.tooltip')}</span>
    </a>
  );
};

export default KofiButton;
