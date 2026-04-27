import React, { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function ApiSetupModal() {
  const { updateApiKey, setShowApiSetup, apiKey } = useApp();
  const [inputKey, setInputKey] = useState(apiKey || '');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (!inputKey.trim()) return;
    updateApiKey(inputKey.trim());
  };

  return (
    <div className="setup-modal-overlay" onClick={(e) => e.target === e.currentTarget && apiKey && setShowApiSetup(false)}>
      <div className="setup-modal">
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>
            </svg>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Enter Groq API Key
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
            Get your free API key from{' '}
            <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1', fontWeight: 600 }}>
              console.groq.com
            </a>
            . Your key is stored locally and never shared.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          <input
            type={showKey ? 'text' : 'password'}
            className="setup-input"
            placeholder="gsk_xxxxxxxxxxxxxxxx"
            value={inputKey}
            onChange={e => setInputKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <button
            onClick={() => setShowKey(!showKey)}
            style={{
              position: 'absolute', right: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', background: 'none',
              border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem',
            }}
          >
            {showKey ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>

        <button
          className="setup-submit-btn"
          onClick={handleSave}
          disabled={!inputKey.trim()}
          style={{ opacity: !inputKey.trim() ? 0.6 : 1 }}
        >
          Save & Start Chatting →
        </button>

        {apiKey && (
          <button
            onClick={() => setShowApiSetup(false)}
            style={{
              width: '100%', marginTop: '0.75rem', padding: '0.75rem',
              background: 'none', border: '1.5px solid #e2e8f0',
              borderRadius: 12, cursor: 'pointer', fontSize: '0.9rem',
              fontFamily: 'var(--font-main)', color: '#64748b',
            }}
          >
            Cancel
          </button>
        )}

        <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 10, fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>
          <strong>Note:</strong> Talk To Expert uses the Groq API (free tier available). Your conversations are stored locally on your device.
        </div>
      </div>
    </div>
  );
}
