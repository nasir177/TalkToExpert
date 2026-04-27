import React, { useState, useEffect } from 'react';
import { EXPERTS } from '../data/experts.js';
import { getRecentConversationsFirestore } from '../services/firestoreService.js';
import BottomNav from '../components/layout/BottomNav.jsx';
import { useApp } from '../context/AppContext.jsx';

// Clean SVG icons (no emoji)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

export default function HomeScreen({ onSelectExpert, activeTab, onTabChange }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [recent, setRecent] = useState([]);
  const { language, user } = useApp();

  const cats = ['All', 'Health', 'Legal', 'Safety', 'Education', 'Finance', 'Fitness', 'Wellness', 'Technology', 'Food', 'Travel'];

  useEffect(() => {
    if (user) getRecentConversationsFirestore(user.uid).then(data => setRecent(data.slice(0, 4)));
  }, [user]);

  const filtered = EXPERTS.filter(e => {
    const q = search.toLowerCase();
    const matchQ = !q || e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.title.toLowerCase().includes(q);
    const matchF = filter === 'All' || e.category === filter;
    return matchQ && matchF;
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--white)', overflow: 'hidden' }}>
      {/* Header */}
      <div className="screen-header">
        <div className="screen-header-inner">
          <div className="brand-row">
            <div className="brand-icon">
              <svg width="16" height="16" viewBox="0 0 44 44" fill="none">
                <path d="M22 6C13.163 6 6 13.163 6 22c0 5.8 3.1 10.9 7.7 13.7V38l8.3-3.8 8.3 3.8v-2.3C34.9 32.9 38 27.8 38 22 38 13.163 30.837 6 22 6z" fill="white"/>
              </svg>
            </div>
            <span className="brand-name">Talk To Expert</span>
          </div>
        </div>

        {/* Search */}
        <div className="search-wrap">
          <span className="search-icon"><SearchIcon /></span>
          <input
            className="search-input"
            type="text"
            placeholder="Search experts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Filter chips */}
        <div className="filter-chips">
          {cats.map(c => (
            <button key={c} className={`filter-chip ${filter === c ? 'active' : ''}`} onClick={() => setFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="home-scroll">
        {/* Greeting */}
        {!search && filter === 'All' && (
          <div>
            <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)', marginBottom: '0.1rem' }}>
              {language === 'hinglish' ? 'Namaste! Aaj kisse baat karni hai?' :
               language === 'japanese' ? 'こんにちは！今日は誰に相談しますか？' :
               'Hello! Who would you like to talk to today?'}
            </div>
          </div>
        )}

        {/* Grid */}
        <div>
          <div className="section-label">{filter === 'All' ? 'All Experts' : filter} ({filtered.length})</div>
          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <div className="empty-icon-box">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <div className="empty-title">No experts found</div>
              <div className="empty-sub">Try a different search term</div>
            </div>
          ) : (
            <div className="expert-grid">
              {filtered.map((expert, i) => (
                <ExpertCard key={expert.id} expert={expert} onClick={() => onSelectExpert(expert.id)} delay={i * 0.035} />
              ))}
            </div>
          )}
        </div>

        {/* Recent conversations */}
        {recent.length > 0 && !search && (
          <div>
            <div className="section-label">Recent Conversations</div>
            <div className="recent-list">
              {recent.map(conv => {
                const exp = EXPERTS.find(e => e.id === conv.expertId);
                if (!exp) return null;
                return (
                  <div key={conv.id} className="recent-item" onClick={() => onSelectExpert(exp.id)}>
                    <div className="recent-avatar">
                      <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${exp.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=80`} alt={exp.name} />
                    </div>
                    <div className="recent-info">
                      <div className="recent-name">{exp.name}</div>
                      <div className="recent-preview">{conv.preview || 'Start a new conversation'}</div>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="2">
                      <path d="m9 18 6-6-6-6"/>
                    </svg>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ height: '0.5rem' }} />
      </div>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
}

function ExpertCard({ expert, onClick, delay }) {
  return (
    <div
      className="expert-card anim-up"
      onClick={onClick}
      style={{ '--card-color': expert.theme.primary, animationDelay: `${delay}s` }}
    >
      <div className="expert-card-avatar">
        <img
          src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${expert.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=96`}
          alt={expert.name}
        />
      </div>
      <div className="expert-card-cat" style={{ color: expert.theme.primary }}>{expert.category}</div>
      <div className="expert-card-name">{expert.name.split(' ').slice(0, 2).join(' ')}</div>
      <div className="expert-card-role">{expert.title}</div>
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
        <span className="online-dot" />
        <span style={{ fontSize: '0.65rem', color: 'var(--gray-400)' }}>{expert.status}</span>
      </div>
    </div>
  );
}
