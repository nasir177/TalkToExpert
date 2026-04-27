import React from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function SideNav({ activeTab, onTabChange }) {
  const { user, signOut } = useApp();

  const tabs = [
    {
      id: 'home',
      label: 'Experts',
      icon: (active) => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'History',
      icon: (active) => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (active) => (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 1.8}>
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      ),
    },
  ];

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || '?';

  return (
    <nav className="side-nav">
      {/* Brand */}
      <div className="side-nav-brand">
        <div className="side-nav-logo">
          <svg width="20" height="20" viewBox="0 0 44 44" fill="none">
            <path d="M22 6C13.163 6 6 13.163 6 22c0 5.8 3.1 10.9 7.7 13.7V38l8.3-3.8 8.3 3.8v-2.3C34.9 32.9 38 27.8 38 22 38 13.163 30.837 6 22 6z" fill="white" opacity="0.95"/>
          </svg>
        </div>
        <div>
          <div className="side-nav-brand-name">TalkToExpert</div>
          <div className="side-nav-brand-sub">AI Expert Platform</div>
        </div>
      </div>

      {/* Nav items */}
      <div className="side-nav-section-label">Navigation</div>
      <div className="side-nav-items">
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`side-nav-item ${active ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <span className="side-nav-item-icon">{tab.icon(active)}</span>
              <span className="side-nav-item-label">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* User section */}
      <div className="side-nav-footer">
        <div className="side-nav-user">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="side-nav-avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="side-nav-avatar-initials">{initials}</div>
          )}
          <div className="side-nav-user-info">
            <div className="side-nav-user-name">
              {user?.displayName || user?.email?.split('@')[0] || 'User'}
            </div>
            <div className="side-nav-user-email">{user?.email || ''}</div>
          </div>
        </div>
        <button className="side-nav-logout" onClick={signOut} title="Sign out">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}
