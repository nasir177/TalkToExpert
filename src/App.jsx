import React, { useState, useEffect } from 'react';
import WelcomeScreen from './screens/WelcomeScreen.jsx';
import HomeScreen from './screens/HomeScreen.jsx';
import ExpertDetailScreen from './screens/ExpertDetailScreen.jsx';
import ChatScreen from './screens/ChatScreen.jsx';
import HistoryScreen from './screens/HistoryScreen.jsx';
import SettingsScreen from './screens/SettingsScreen.jsx';
import LoginScreen from './screens/LoginScreen.jsx';
import SplashScreen from './screens/SplashScreen.jsx';
import NotificationToast from './components/common/NotificationToast.jsx';
import SideNav from './components/layout/SideNav.jsx';
import { useApp } from './context/AppContext.jsx';

export default function App() {
  const [screen, setScreen] = useState('home');
  const [selectedExpertId, setSelectedExpertId] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [splashDone, setSplashDone] = useState(false);
  const { notifications, user, authLoading } = useApp();

  const navigate = (to, expertId = null) => {
    setScreen(to);
    if (expertId) setSelectedExpertId(expertId);
  };

  // Show splash once per session
  useEffect(() => {
    const done = sessionStorage.getItem('splashDone');
    if (done) setSplashDone(true);
  }, []);

  const handleSplashFinish = () => {
    setSplashDone(true);
    sessionStorage.setItem('splashDone', '1');
  };

  if (!splashDone) return <SplashScreen onFinish={handleSplashFinish} />;
  if (authLoading) return <div className="auth-loading"><div className="auth-spinner" /></div>;
  if (!user) return <LoginScreen onLogin={() => {}} />;

  const tabNav = (tab) => {
    setActiveTab(tab);
    navigate(tab === 'home' ? 'home' : tab);
  };

  const renderScreen = () => {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            onSelectExpert={(id) => navigate('detail', id)}
            activeTab={activeTab}
            onTabChange={tabNav}
          />
        );
      case 'detail':
        return (
          <ExpertDetailScreen
            expertId={selectedExpertId}
            onBack={() => navigate('home')}
            onStartChat={() => navigate('chat')}
            activeTab={activeTab}
            onTabChange={tabNav}
          />
        );
      case 'chat':
        return (
          <ChatScreen
            expertId={selectedExpertId}
            onBack={() => navigate('detail')}
          />
        );
      case 'history':
        return (
          <HistoryScreen
            onBack={() => navigate('home')}
            onOpenChat={(expertId) => { setSelectedExpertId(expertId); navigate('chat'); }}
            activeTab={activeTab}
            onTabChange={tabNav}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            onBack={() => navigate('home')}
            activeTab={activeTab}
            onTabChange={tabNav}
          />
        );
      default:
        return (
          <HomeScreen
            onSelectExpert={(id) => navigate('detail', id)}
            activeTab={activeTab}
            onTabChange={tabNav}
          />
        );
    }
  };

  return (
    <div className="app-root">
      {/* Desktop sidebar — hidden on mobile via CSS */}
      <SideNav activeTab={activeTab} onTabChange={tabNav} />

      {/* Main content */}
      <div className="app-container">
        {renderScreen()}
        <NotificationToast notifications={notifications} />
      </div>
    </div>
  );
}
