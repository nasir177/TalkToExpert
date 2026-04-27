import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getExpertById } from '../data/experts.js';
import { chatWithExpert, parseInteractiveElements, translateMessage } from '../services/groqAPI.js';
import { useApp, WORLD_LANGUAGES } from '../context/AppContext.jsx';
import {
  getOrCreateConversationFirestore,
  saveMessageFirestore,
  getMessagesFirestore,
} from '../services/firestoreService.js';
import { exportConversationAsText } from '../services/storageService.js';

/* ---- Formatted text renderer ---- */
function FmtText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\n)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2,-2)}</strong>;
        if (p.startsWith('`') && p.endsWith('`')) return <code key={i}>{p.slice(1,-1)}</code>;
        if (p === '\n') return <br key={i}/>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

/* ---- Yes / No buttons ---- */
function YesNo({ el, onChoose, active, primary }) {
  const [sel, setSel] = useState(null);
  const pick = (v, label) => { if (!active || sel) return; setSel(v); onChoose(label); };
  return (
    <div style={{ marginTop: '0.6rem' }}>
      <div className="interactive-q-label">{el.question}</div>
      <div className="yn-row">
        <button className={`yn-btn yes-btn ${sel==='yes'?'chosen':''}`} onClick={() => pick('yes', el.yesLabel)} disabled={!active || !!sel}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {el.yesLabel}
        </button>
        <button className={`yn-btn no-btn ${sel==='no'?'chosen':''}`} onClick={() => pick('no', el.noLabel)} disabled={!active || !!sel}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          {el.noLabel}
        </button>
      </div>
    </div>
  );
}

/* ---- Multiple choice ---- */
function Choices({ el, onChoose, active }) {
  const [sel, setSel] = useState(null);
  const pick = (o) => { if (!active || sel) return; setSel(o); onChoose(o); };
  return (
    <div style={{ marginTop: '0.6rem' }}>
      <div className="interactive-q-label">{el.question}</div>
      <div className="choice-col">
        {el.options.map((o, i) => (
          <button key={i} className={`choice-btn ${sel===o?'chosen':''}`} onClick={() => pick(o)} disabled={!active || !!sel}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>{sel===o && <polyline points="20 6 9 17 4 12"/>}
            </svg>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- Breathing widget ---- */
function Breathing({ primary }) {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState(null);
  const tRef = useRef(null);
  useEffect(() => {
    if (!active) { setPhase(null); return; }
    let i = 0;
    const phases = [{ label: 'Breathe In...', dur: 4000 }, { label: 'Hold...', dur: 4000 }, { label: 'Breathe Out...', dur: 4000 }];
    const run = () => { setPhase(phases[i % 3].label); tRef.current = setTimeout(() => { i++; run(); }, phases[i % 3].dur); };
    run();
    return () => clearTimeout(tRef.current);
  }, [active]);
  return (
    <div className="widget-card" style={{ borderColor: primary + '33' }}>
      <div className="widget-title">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={primary} strokeWidth="2">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 8v4l3 3"/>
        </svg>
        Breathing Exercise
      </div>
      {active && phase && <div style={{ textAlign: 'center', padding: '0.75rem 0', color: primary, fontWeight: 600, fontSize: '0.9rem' }}>{phase}</div>}
      <button onClick={() => setActive(!active)} style={{ background: active ? '#f1f5f9' : primary, color: active ? 'var(--gray-600)' : 'white', border: 'none', borderRadius: 100, padding: '0.35rem 0.9rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-main)' }}>
        {active ? 'Stop' : 'Start Exercise'}
      </button>
    </div>
  );
}

/* ---- WhatsApp Share Overlay ---- */
function ShareOverlay({ text, onClose }) {
  const handleShare = () => {
    const msg = encodeURIComponent(`*Talk To Expert says:*\n\n${text}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    onClose();
  };
  return (
    <div className="share-overlay" onClick={onClose}>
      <div className="share-popup" onClick={e => e.stopPropagation()}>
        <div className="share-popup-msg">Share this response?</div>
        <div className="share-popup-preview">{text.slice(0, 100)}{text.length > 100 ? '...' : ''}</div>
        <div className="share-popup-actions">
          <button className="share-cancel-btn" onClick={onClose}>Cancel</button>
          <button className="share-wa-btn" onClick={handleShare}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Share on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---- Message Bubble with long-press ---- */
function Bubble({ msg, expert, onChoose, isLatestAI, onLongPress }) {
  const isUser = msg.sender === 'user';
  const t = expert?.theme;
  const fmt = (ts) => ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const pressTimer = useRef(null);

  const handleTouchStart = () => {
    if (isUser) return;
    pressTimer.current = setTimeout(() => onLongPress(msg.text), 600);
  };
  const handleTouchEnd = () => clearTimeout(pressTimer.current);
  const handleMouseDown = () => {
    if (isUser) return;
    pressTimer.current = setTimeout(() => onLongPress(msg.text), 700);
  };
  const handleMouseUp = () => clearTimeout(pressTimer.current);

  return (
    <div className={`msg-grp ${isUser ? 'user' : 'ai'}`}>
      {!isUser ? (
        <div className="msg-with-avatar">
          <div className="mini-avatar">
            <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${expert?.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=56`} alt="" />
          </div>
          <div style={{ maxWidth: '80%' }}>
            <div
              className="bubble ai"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{ userSelect: 'none' }}
            >
              {msg.translating ? (
                <span style={{ color: 'var(--gray-400)', fontStyle: 'italic', fontSize: '0.82rem' }}>Translating...</span>
              ) : (
                <FmtText text={msg.text} />
              )}
              {msg.interactiveElements?.map((el, i) => {
                if (el.type === 'yesno') return <YesNo key={i} el={el} onChoose={onChoose} active={isLatestAI} primary={t?.primary} />;
                if (el.type === 'choice') return <Choices key={i} el={el} onChoose={onChoose} active={isLatestAI} />;
                if (el.type === 'breathing') return <Breathing key={i} primary={t?.primary || '#6366f1'} />;
                if (el.type === 'recipe' || el.type === 'trip') return (
                  <div key={i} className="widget-card">
                    <pre className="widget-content">{el.content}</pre>
                  </div>
                );
                return null;
              })}
            </div>
            <div className="msg-time ai">{fmt(msg.timestamp)}</div>
          </div>
        </div>
      ) : (
        <div>
          <div className="bubble user" style={{ background: t?.userBubble || 'var(--brand)' }}>
            <FmtText text={msg.text} />
          </div>
          <div className="msg-time">{fmt(msg.timestamp)}</div>
        </div>
      )}
    </div>
  );
}

/* ---- Typing indicator ---- */
function Typing({ expert }) {
  return (
    <div className="typing-wrap">
      <div className="mini-avatar">
        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${expert?.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=56`} alt="" />
      </div>
      <div className="typing-dots">
        {[0,1,2].map(i => (
          <div key={i} className="typing-dot" style={{ background: expert?.theme?.primary || '#6366f1' }} />
        ))}
      </div>
    </div>
  );
}

/* ---- Language Mini Picker ---- */
function LangPicker({ language, onSelect, primary }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = WORLD_LANGUAGES.find(l => l.code === language);
  const popular = WORLD_LANGUAGES.slice(0, 14);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button
        className="chat-icon-btn lang-chip"
        onClick={() => setOpen(!open)}
        title="Change language"
        style={{ gap: '0.3rem', padding: '0.3rem 0.55rem' }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        <span style={{ fontSize: '0.7rem', fontWeight: 700 }}>{current?.native?.slice(0,5) || 'EN'}</span>
      </button>
      {open && (
        <div className="chat-lang-menu">
          <div className="chat-lang-menu-title">Language</div>
          {popular.map(l => (
            <button
              key={l.code}
              className={`chat-lang-item ${language === l.code ? 'active' : ''}`}
              onClick={() => { onSelect(l.code); setOpen(false); }}
            >
              <span className="chat-lang-native">{l.native}</span>
              <span className="chat-lang-label">{l.label}</span>
              {language === l.code && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---- Main Chat Screen ---- */
export default function ChatScreen({ expertId, onBack }) {
  const expert = getExpertById(expertId);
  const { language, updateLanguage, addNotification, user } = useApp();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [convId, setConvId] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [recording, setRecording] = useState(false);
  const [shareText, setShareText] = useState(null);
  const [translatingAll, setTranslatingAll] = useState(false);

  const endRef = useRef(null);
  const textRef = useRef(null);
  const recRef = useRef(null);
  const prevLangRef = useRef(language);

  // Load conversation from Firestore
  useEffect(() => {
    if (!expert || !user) return;
    getOrCreateConversationFirestore(user.uid, expertId).then(async id => {
      setConvId(id);
      const saved = await getMessagesFirestore(user.uid, id);
      if (saved.length === 0) {
        setMessages([{
          id: 'starter', sender: 'ai',
          text: expert.conversationStarters[Math.floor(Math.random() * expert.conversationStarters.length)],
          timestamp: Date.now(), interactiveElements: [],
        }]);
      } else {
        setMessages(saved);
      }
    });
  }, [expertId, user]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  // When language changes: translate last N AI messages
  useEffect(() => {
    if (prevLangRef.current === language) return;
    const prev = prevLangRef.current;
    prevLangRef.current = language;

    // Translate the last 5 AI messages
    const translateLast = async () => {
      setTranslatingAll(true);
      setMessages(prev => prev.map(m =>
        m.sender === 'ai' ? { ...m, translating: true } : m
      ));

      const updated = await Promise.all(
        messages.map(async m => {
          if (m.sender !== 'ai' || m.id === 'starter') return m;
          const translated = await translateMessage(m.text, language);
          return { ...m, text: translated, translating: false };
        })
      );

      setMessages(updated);
      setTranslatingAll(false);
      addNotification(`Language switched! AI will now respond in ${WORLD_LANGUAGES.find(l => l.code === language)?.label || language}`, 'success');
    };

    translateLast();
  }, [language]);

  const send = useCallback(async (text) => {
    if (!text.trim() || loading || !expert || !user) return;

    const userMsg = { id: Date.now(), sender: 'user', text: text.trim(), timestamp: Date.now(), interactiveElements: [] };
    setMessages(p => [...p, userMsg]);
    setInput('');
    setLoading(true);
    if (convId) await saveMessageFirestore(user.uid, convId, 'user', text.trim());

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const raw = await chatWithExpert({ expertId, userMessage: text.trim(), conversationHistory: history, language });
      const { text: clean, interactiveElements } = parseInteractiveElements(raw);
      const aiMsg = { id: Date.now() + 1, sender: 'ai', text: clean, timestamp: Date.now(), interactiveElements };
      setMessages(p => [...p, aiMsg]);
      if (convId) await saveMessageFirestore(user.uid, convId, 'ai', clean, interactiveElements);
    } catch (err) {
      const txt = err.message === 'RATE_LIMITED' ? '⏳ Rate limited. Wait a moment and try again.'
        : err.message === 'INVALID_API_KEY' ? '🔑 Invalid API key. Check .env.local file.'
        : `⚠️ Error: ${err.message}`;
      addNotification(txt, 'error');
      setMessages(p => [...p, { id: Date.now(), sender: 'ai', text: txt, timestamp: Date.now(), interactiveElements: [] }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, expert, convId, language, expertId, user]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const handleVoice = () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) { addNotification('Voice not supported in this browser.', 'warning'); return; }
    if (recording) { recRef.current?.stop(); setRecording(false); return; }
    const r = new R();
    const lang = WORLD_LANGUAGES.find(l => l.code === language);
    r.lang = lang?.iso ? `${lang.iso}-${lang.iso.toUpperCase()}` : 'en-US';
    r.onresult = (e) => setInput(p => p + e.results[0][0].transcript);
    r.onend = () => setRecording(false);
    r.onerror = () => setRecording(false);
    recRef.current = r;
    r.start();
    setRecording(true);
  };

  const handleLangChange = (code) => {
    updateLanguage(code);
  };

  if (!expert) return null;
  const t = expert.theme;
  const latestAiId = [...messages].reverse().find(m => m.sender === 'ai')?.id;

  return (
    <div className="chat-screen" style={{ '--expert-primary': t.primary }}>
      {shareText && <ShareOverlay text={shareText} onClose={() => setShareText(null)} />}

      {/* Translating banner */}
      {translatingAll && (
        <div className="translating-banner">
          <div className="translating-spinner" />
          Translating conversation...
        </div>
      )}

      {/* Top bar */}
      <div className="chat-topbar" style={{ borderBottom: `2px solid ${t.primary}22` }}>
        <button className="chat-icon-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>

        <div className="chat-header-avatar" style={{ borderColor: t.primary }}>
          <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${expert.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=72`} alt={expert.name} />
        </div>

        <div className="chat-hdr-info">
          <div className="chat-hdr-name">{expert.name}</div>
          <div className="chat-hdr-status">
            <span className="online-dot" />
            {loading ? 'Typing...' : expert.status}
          </div>
        </div>

        <LangPicker language={language} onSelect={handleLangChange} primary={t.primary} />

        <div style={{ position: 'relative' }}>
          <button className="chat-icon-btn" onClick={() => setShowMenu(!showMenu)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
            </svg>
          </button>
          {showMenu && (
            <div className="chat-menu">
              <button className="chat-menu-item" onClick={async () => { if (convId) { await exportConversationAsText(convId, expert.name); addNotification('Exported!', 'success'); } setShowMenu(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Export Chat
              </button>
              <button className="chat-menu-item danger" onClick={() => { setMessages([]); setShowMenu(false); }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                </svg>
                Clear Chat
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expert context strip */}
      <div style={{ padding: '0.4rem 1rem', background: t.primary + '0d', borderBottom: `1px solid ${t.primary}22`, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', color: t.textColor || t.primary }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        {expert.disclaimer}
      </div>

      {/* Messages */}
      <div className="chat-msgs" onClick={() => setShowMenu(false)}>
        {messages.map((msg, i) => (
          <Bubble
            key={msg.id || i}
            msg={msg}
            expert={expert}
            onChoose={(label) => send(label)}
            isLatestAI={msg.id === latestAiId && msg.sender === 'ai'}
            onLongPress={(text) => setShareText(text)}
          />
        ))}
        {loading && <Typing expert={expert} />}
        <div ref={endRef} />
      </div>

      {/* Quick replies */}
      {!loading && messages.length <= 2 && (
        <div className="quick-replies-row">
          {expert.quickQuestions.map((q, i) => (
            <button key={i} className="qr-chip" onClick={() => send(q)} style={{ '--expert-primary': t.primary }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="chat-input-area">
        <div className="input-row">
          <div className="input-box">
            <textarea
              ref={textRef}
              rows={1}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${expert.name.split(' ')[0]}...`}
              disabled={loading}
            />
          </div>
          <button className={`mic-btn ${recording ? 'recording' : ''}`} onClick={handleVoice}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
            </svg>
          </button>
          <button
            className="send-btn"
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            style={{ background: t.primary }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
