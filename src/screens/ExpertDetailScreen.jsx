import React from 'react';
import { getExpertById } from '../data/experts.js';
import BottomNav from '../components/layout/BottomNav.jsx';

// SVG check mark
const CheckIcon = ({ color }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function ExpertDetailScreen({ expertId, onBack, onStartChat, activeTab, onTabChange }) {
  const expert = getExpertById(expertId);
  if (!expert) return null;
  const t = expert.theme;

  return (
    <div className="detail-screen">
      {/* Top bar */}
      <div className="detail-top-bar">
        <button className="back-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <div className="detail-top-title">{expert.name}</div>
        <div style={{ width: 34 }} />
      </div>

      <div className="detail-scroll">
        {/* Hero */}
        <div
          className="detail-hero"
          style={{
            '--expert-primary': t.primary,
            '--expert-secondary': t.secondary,
            background: t.gradient,
          }}
        >
          <div className="detail-avatar-ring">
            <div className="detail-avatar-inner">
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${expert.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=180`}
                alt={expert.name}
              />
            </div>
          </div>
          <div className="detail-name">{expert.name}</div>
          <div className="detail-role">{expert.title}</div>
          <div className="detail-tagline-pill">"{expert.tagline}"</div>
          <div className="detail-status-row">
            <span className="online-dot" />
            <span>{expert.status}</span>
          </div>
        </div>

        {/* Capabilities */}
        <div className="detail-section">
          <div className="detail-sec-title">What I can help with</div>
          {expert.capabilities.map((cap, i) => (
            <div key={i} className="capability-row">
              <div className="cap-icon" style={{ background: t.primary + '18' }}>
                <CheckIcon color={t.primary} />
              </div>
              <span>{cap}</span>
            </div>
          ))}
        </div>

        {/* Quick Questions */}
        <div className="detail-section">
          <div className="detail-sec-title">Try asking</div>
          <div className="qq-wrap">
            {expert.quickQuestions.map((q, i) => (
              <button key={i} className="qq-chip" onClick={() => onStartChat(q)}>{q}</button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="detail-section">
          <div className="disclaimer-strip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="m10.29 3.86-8.5 14.75A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.71-3.02L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            {expert.disclaimer}
          </div>
        </div>

        {/* CTA */}
        <div className="detail-cta-area">
          <button
            className="start-btn"
            style={{ '--expert-primary': t.primary, background: t.primary }}
            onClick={() => onStartChat()}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Start Conversation
          </button>
        </div>

        <div style={{ height: '0.5rem' }} />
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
