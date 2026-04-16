import React, { useState } from 'react';
import './InfoButton.css';
import { useLanguage } from '../contexts/LanguageContext';

const InfoButton = () => {
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const closeOnOverlayClick = (e) => {
    if (e.target.className === 'info-modal-overlay') {
      setIsModalOpen(false);
    }
  };

  return (
    <>
      <button className="info-floating-btn" onClick={toggleModal}>
        <div className="info-icon-container">
          <span className="info-icon">❓</span>
        </div>
        <span className="info-text">{t('info.tooltip')}</span>
      </button>

      {isModalOpen && (
        <div className="info-modal-overlay" onClick={closeOnOverlayClick}>
          <div className="info-modal-content">
            <div className="info-modal-header">
              <h2>{t('info.title')}</h2>
              <button className="info-close-btn" onClick={toggleModal}>
                &times;
              </button>
            </div>
            <div className="info-section">
              <ol className="info-list">
                <li><span dangerouslySetInnerHTML={{ __html: t('info.desc1').replace('Focus Together', '<strong>Focus Together</strong>') }} /></li>
                <li>{t('info.desc2')}</li>
                <li>{t('info.desc3')}</li>
                <li>{t('info.desc4')}</li>
                <li>{t('info.desc5')}</li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InfoButton;
