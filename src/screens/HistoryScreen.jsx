import React, { useState, useEffect } from 'react';
import { EXPERTS } from '../data/experts.js';
import { getRecentConversationsFirestore, deleteConversationFirestore, clearAllHistoryFirestore } from '../services/firestoreService.js';
import BottomNav from '../components/layout/BottomNav.jsx';
import { useApp } from '../context/AppContext.jsx';

export default function HistoryScreen({ onOpenChat, activeTab, onTabChange }) {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification, user } = useApp();

  useEffect(() => { if (user) load(); }, [user]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getRecentConversationsFirestore(user.uid);
      setConvs(data);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await deleteConversationFirestore(user.uid, id);
    load();
    addNotification('Conversation deleted', 'info');
  };

  const handleClearAll = async () => {
    if (!window.confirm('Clear all conversation history?')) return;
    await clearAllHistoryFirestore(user.uid);
    setConvs([]);
    addNotification('All history cleared', 'info');
  };

  return (
    <div className="history-screen">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span className="page-title">History</span>
          <span className="badge">{convs.length}</span>
        </div>
        {convs.length > 0 && (
          <button className="danger-text-btn" onClick={handleClearAll}>Clear All</button>
        )}
      </div>

      <div className="history-list">
        {loading ? (
          <div className="empty-state">
            <div className="history-loading-spinner" />
            <div className="empty-sub" style={{ marginTop: '1rem' }}>Loading conversations...</div>
          </div>
        ) : convs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon-box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div className="empty-title">No conversations yet</div>
            <div className="empty-sub">Start chatting with any expert to see your history here.</div>
          </div>
        ) : convs.map(conv => {
          const exp = EXPERTS.find(e => e.id === conv.expertId);
          if (!exp) return null;
          const updatedAt = conv.updatedAt?.toDate ? conv.updatedAt.toDate() : new Date(conv.updatedAt || Date.now());
          return (
            <div key={conv.id} className="history-item" onClick={() => onOpenChat(exp.id)}>
              <div className="history-avatar" style={{ border: `2px solid ${exp.theme.primary}33` }}>
                <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${exp.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=80`} alt={exp.name} />
              </div>
              <div className="history-info">
                <div className="history-name">{exp.name}</div>
                <div className="history-preview">{conv.preview || 'Tap to continue'}</div>
                <div className="history-date">{updatedAt.toLocaleDateString()}</div>
              </div>
              <button className="del-btn" onClick={(e) => handleDelete(e, conv.id)} title="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}
