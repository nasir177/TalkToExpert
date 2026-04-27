import React from 'react';

const icons = {
  info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  success: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  error: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  warning: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m10.29 3.86-8.5 14.75A2 2 0 0 0 3.5 21h17a2 2 0 0 0 1.71-3.02L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg>,
};

export default function NotificationToast({ notifications }) {
  if (!notifications.length) return null;
  return (
    <div className="toast-stack">
      {notifications.map(n => (
        <div key={n.id} className={`toast ${n.type || 'info'}`}>
          {icons[n.type || 'info']}
          {n.message}
        </div>
      ))}
    </div>
  );
}
