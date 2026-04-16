import React from 'react';
import './LangButton.css';
import { useLanguage } from '../contexts/LanguageContext';

const LangButton = () => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="lang-toggle-container">
      <div className={`lang-toggle-bg ${language}`}></div>
      <button 
        className={`lang-toggle-btn ${language === 'ko' ? 'active' : ''}`}
        onClick={() => setLanguage('ko')}
      >
        KO
      </button>
      <button 
        className={`lang-toggle-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};

export default LangButton;
