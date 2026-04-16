import React, { createContext, useState, useContext, useEffect } from 'react';

const translations = {
  ko: {
    'home.creating': '생성 중...',
    'home.wakingServer': '서버를 깨우는 중입니다... (최대 1분 소요)',
    'home.createFail': '방 생성에 실패했습니다.',
    'home.createBtn': '새 방 만들기',
    'home.placeholder': '방 코드 입력',
    'home.joinBtn': '참여하기',
    
    'host.codeLabel': '참여용 방 코드',
    'host.copyTitle': '초대장 복사하기',
    'host.usersOnline': '현재 {count}명 접속 중',
    'host.minute': '분',
    'host.startBtn': '타이머 시작',
    'host.pauseBtn': '일시정지',
    'host.resumeBtn': '다시 시작',
    'host.finished': '종료되었습니다!',
    'host.resetBtn': '초기화 후 재설정',
    'host.homeBtn': '홈으로',
    'host.toast': '해당 방의 초대장이 클립보드에 복사되었습니다!',
    
    'guest.errorTitle': '오류 발생',
    'guest.goHome': '홈으로',
    'guest.joinTitle': '타이머에 참여하시겠습니까?',
    'guest.joinDesc': '호스트가 시작하면 타이머가 자동으로 동기화됩니다.',
    'guest.cancelBtn': '취소',
    'guest.approveBtn': '승인',
    'guest.connecting': '접속 중...',
    'guest.waitingHost': '호스트가 시작하기를 기다리는 중...',
    'guest.hostPaused': '호스트가 타이머를 일시정지했습니다...',
    'guest.codeLabel': '참여한 방 코드',
    'guest.usersOnline': '현재 {count}명 접속 중',
    'guest.waiting': '호스트가 타이머를 설정 중입니다...',
    'guest.finished': '타이머가 종료되었습니다!',
    
    'info.tooltip': '사용방법 보기',
    'info.title': '사용방법',
    'info.desc1': 'Focus Together는 초대한 사용자 모두에게 동시에 작동하는 동시 타이머 입니다.',
    'info.desc2': '방을 만드세요.',
    'info.desc3': '함께 타이머를 볼 사람에게 방의 초대장을 공유하세요.',
    'info.desc4': '시간을 정하고 시작하세요. 방에 입장한 사람은 모두 현재 작동 하는 타이머를 본인들의 장치에서 동시에 보게 됩니다.',
    'info.desc5': '함께 집중하거나 타이밍을 맞춰야하는 작업에서 사용해보세요.',
    
    'kofi.tooltip': '개발자에게 커피 사주기 ☕️',
    
    'theme.tooltip': '테마 변경',
    'theme.title': '테마 선택 🎨',
    'theme.changeBtn': '테마 변경하기',
    'theme.current': '(현재)',
    'theme.mac': '기본 맥북 스타일',
    'theme.monochrome': '모노크롬 느와르 ♟️',
    
    'timer.titleFocus': '{min}:{sec} - 집중',
    'timer.pipErrorNotSupported': '현재 브라우저 환경에서는 PIP 화면 캡처 기능을 지원하지 않습니다.\n크롬 호환 브라우저를 권장합니다!',
    'timer.pipErrorNoFeature': '이 브라우저에서는 기능(PIP)을 지원하지 않습니다.',
    'timer.pipErrorFail': 'PIP 기능을 실행할 수 없습니다.\n데스크탑 크롬, 엣지, 사파리를 이용해 주세요!',
    'timer.pipOff': 'PIP 끄기',
    'timer.pipOn': '플로팅 모드(PIP)',
    
    'lang.en': 'English',
    'lang.ko': '한국어'
  },
  en: {
    'home.creating': 'Creating...',
    'home.wakingServer': 'Waking up server... (Up to 1 min)',
    'home.createFail': 'Failed to create room.',
    'home.createBtn': 'Create New Room',
    'home.placeholder': 'Enter Room Code',
    'home.joinBtn': 'Join',
    
    'host.codeLabel': 'Room Code',
    'host.copyTitle': 'Copy Invite',
    'host.usersOnline': '{count} user(s) online',
    'host.minute': 'min',
    'host.startBtn': 'Start Timer',
    'host.pauseBtn': 'Pause',
    'host.resumeBtn': 'Resume',
    'host.finished': 'Time is up!',
    'host.resetBtn': 'Reset Timer',
    'host.homeBtn': 'Go Home',
    'host.toast': 'Room invite copied to clipboard!',
    
    'guest.errorTitle': 'Error occurred',
    'guest.goHome': 'Go Home',
    'guest.joinTitle': 'Would you like to join the timer?',
    'guest.joinDesc': 'The timer will automatically sync when the host starts.',
    'guest.cancelBtn': 'Cancel',
    'guest.approveBtn': 'Join',
    'guest.connecting': 'Connecting...',
    'guest.waitingHost': 'Waiting for host to start...',
    'guest.hostPaused': 'Host paused the timer...',
    'guest.codeLabel': 'Room Code',
    'guest.usersOnline': '{count} user(s) online',
    'guest.waiting': 'Waiting for host to set the timer...',
    'guest.finished': 'Time is up!',
    
    'info.tooltip': 'How to use',
    'info.title': 'How to use',
    'info.desc1': 'Focus Together is a synchronized timer for all invited users.',
    'info.desc2': 'Create a room.',
    'info.desc3': 'Share the room invite with people you want to focus with.',
    'info.desc4': 'Set the time and start. Everyone in the room will see the same timer running simultaneously.',
    'info.desc5': 'Use it for collaborative work or tasks requiring synchronization.',
    
    'kofi.tooltip': 'Buy me a coffee ☕️',
    
    'theme.tooltip': 'Change Theme',
    'theme.title': 'Select Theme 🎨',
    'theme.changeBtn': 'Change Theme',
    'theme.current': '(Current)',
    'theme.mac': 'Default MacBook Style',
    'theme.monochrome': 'Monochrome Noir ♟️',
    
    'timer.titleFocus': '{min}:{sec} - Focus',
    'timer.pipErrorNotSupported': 'Current browser does not support PIP screen capture.\nChrome compatible browser is recommended!',
    'timer.pipErrorNoFeature': 'This browser does not support PIP feature.',
    'timer.pipErrorFail': 'Cannot run PIP feature.\nPlease use Desktop Chrome, Edge, or Safari!',
    'timer.pipOff': 'Turn off PIP',
    'timer.pipOn': 'Floating Mode (PIP)',
    
    'lang.en': 'English',
    'lang.ko': '한국어'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLang') || 'ko';
  });

  useEffect(() => {
    localStorage.setItem('appLang', language);
  }, [language]);

  const t = (key, params = {}) => {
    let str = translations[language][key] || key;
    Object.keys(params).forEach(p => {
      str = str.replace(`{${p}}`, params[p]);
    });
    return str;
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ko' ? 'en' : 'ko');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
