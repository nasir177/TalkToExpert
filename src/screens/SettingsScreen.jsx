import React, { useState } from 'react';
import { useApp, WORLD_LANGUAGES } from '../context/AppContext.jsx';
import { clearAllHistoryFirestore } from '../services/firestoreService.js';
import BottomNav from '../components/layout/BottomNav.jsx';

export default function SettingsScreen({ activeTab, onTabChange }) {
  const { language, updateLanguage, addNotification, user, signOut } = useApp();
  const [notifOn, setNotifOn] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [langSearch, setLangSearch] = useState('');
  const [showLangModal, setShowLangModal] = useState(false);

  const filteredLangs = WORLD_LANGUAGES.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearch.toLowerCase())
  );

  const currentLang = WORLD_LANGUAGES.find(l => l.code === language) || WORLD_LANGUAGES[0];

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <div className="settings-screen">
      <div className="page-header">
        <span className="page-title">Settings</span>
      </div>

      <div className="settings-scroll">

        {/* Account */}
        <div>
          <div className="settings-group-label">Account</div>
          <div className="settings-group">
            <div className="settings-row" style={{ cursor: 'default' }}>
              <div className="settings-row-left">
                <div className="settings-avatar-box">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="avatar" className="settings-avatar-img" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="settings-avatar-initials">{initials}</div>
                  )}
                </div>
                <div>
                  <div className="settings-label">{user?.displayName || 'User'}</div>
                  <div className="settings-sub">{user?.email || ''}</div>
                </div>
              </div>
            </div>

            <div className="settings-row" onClick={signOut} style={{ cursor: 'pointer' }}>
              <div className="settings-row-left">
                <div className="settings-icon-box" style={{ background: '#fff1f2' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </div>
                <div className="settings-label" style={{ color: '#dc2626' }}>Sign Out</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Language */}
        <div>
          <div className="settings-group-label">Language</div>
          <div className="settings-group">
            <div className="settings-row" onClick={() => setShowLangModal(true)}>
              <div className="settings-row-left">
                <div className="settings-icon-box" style={{ background: '#eff6ff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </div>
                <div>
                  <div className="settings-label">Response Language</div>
                  <div className="settings-sub">{currentLang.label} — {currentLang.native}</div>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <div className="settings-group-label">Preferences</div>
          <div className="settings-group">
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-icon-box" style={{ background: '#eff6ff' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </div>
                <div className="settings-label">Notifications</div>
              </div>
              <button className={`toggle ${notifOn ? 'on' : ''}`} onClick={() => setNotifOn(!notifOn)}>
                <div className="toggle-knob" />
              </button>
            </div>
            <div className="settings-row">
              <div className="settings-row-left">
                <div className="settings-icon-box" style={{ background: '#fefce8' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </div>
                <div className="settings-label">Sound Effects</div>
              </div>
              <button className={`toggle ${soundOn ? 'on' : ''}`} onClick={() => setSoundOn(!soundOn)}>
                <div className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        {/* Data */}
        <div>
          <div className="settings-group-label">Data</div>
          <div className="settings-group">
            <div className="settings-row" onClick={async () => {
              if (!window.confirm('Clear all conversation history?')) return;
              if (user) await clearAllHistoryFirestore(user.uid);
              addNotification('All history cleared', 'info');
            }}>
              <div className="settings-row-left">
                <div className="settings-icon-box" style={{ background: '#fff1f2' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </div>
                <div>
                  <div className="settings-label" style={{ color: '#dc2626' }}>Clear All History</div>
                  <div className="settings-sub">Delete all saved conversations</div>
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </div>
          </div>
        </div>

        {/* About */}
        <div style={{ textAlign: 'center', padding: '0.5rem 0 0.25rem', color: 'var(--gray-400)', fontSize: '0.78rem' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--gray-500)', marginBottom: '0.2rem' }}>
            Talk To Expert · v2.0
          </div>
          <div>Powered by Llama 3.3 </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />

      {/* Language Modal */}
      {showLangModal && (
        <div className="lang-modal-overlay" onClick={() => setShowLangModal(false)}>
          <div className="lang-modal" onClick={e => e.stopPropagation()}>
            <div className="lang-modal-header">
              <h2 className="lang-modal-title">Choose Language</h2>
              <button className="lang-modal-close" onClick={() => setShowLangModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="lang-modal-search">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search language..."
                value={langSearch}
                onChange={e => setLangSearch(e.target.value)}
                className="lang-modal-input"
                autoFocus
              />
            </div>

            <div className="lang-modal-list">
              {filteredLangs.map(l => (
                <button
                  key={l.code}
                  className={`lang-modal-item ${language === l.code ? 'active' : ''}`}
                  onClick={() => {
                    updateLanguage(l.code);
                    setShowLangModal(false);
                    setLangSearch('');
                    addNotification(`Language set to ${l.label}`, 'success');
                  }}
                >
                  <div className="lang-item-left">
                    <span className="lang-item-native">{l.native}</span>
                    <span className="lang-item-label">{l.label}</span>
                  </div>
                  {language === l.code && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              ))}
              {filteredLangs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--gray-400)' }}>No language found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
