import React, { useEffect, useRef } from 'react';

export default function WelcomeScreen({ onStart }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      dx: (Math.random() - 0.5) * 0.35, dy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    let id;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99,102,241,${p.alpha})`;
        ctx.fill();
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
      });
      id = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize); };
  }, []);

  const experts = [
    { seed: 'DrPriya', label: 'Doctor' },
    { seed: 'AdvSharma', label: 'Legal' },
    { seed: 'CoachArjun', label: 'Fitness' },
    { seed: 'ProfMehta', label: 'Teacher' },
    { seed: 'CAGupta', label: 'Finance' },
    { seed: 'DevBhaiya', label: 'Coding' },
  ];

  return (
    <div className="welcome-screen">
      {/* Subtle gradient blobs */}
      <div className="welcome-bg">
        <div className="welcome-blob" style={{ width: 280, height: 280, background: '#eef2ff', top: -80, right: -60 }} />
        <div className="welcome-blob" style={{ width: 220, height: 220, background: '#faf5ff', bottom: 60, left: -60 }} />
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.6 }} />
      </div>

      <div className="welcome-content">
        {/* Logo */}
        <div className="welcome-logo-wrap">
          <svg width="38" height="38" viewBox="0 0 44 44" fill="none">
            <path d="M22 6C13.163 6 6 13.163 6 22c0 5.8 3.1 10.9 7.7 13.7V38l8.3-3.8 8.3 3.8v-2.3C34.9 32.9 38 27.8 38 22 38 13.163 30.837 6 22 6z" fill="white" opacity="0.95"/>
            <rect x="19" y="15" width="6" height="14" rx="2" fill="rgba(99,102,241,0.6)"/>
            <rect x="15" y="19" width="14" height="6" rx="2" fill="rgba(99,102,241,0.6)"/>
          </svg>
        </div>

        {/* Badge */}
        <div className="welcome-tagline-pill">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
          India's #1 AI Expert Platform
        </div>

        <h1 className="welcome-title">Talk To Expert</h1>
        <p className="welcome-sub">
          12 specialized AI experts available 24/7 — in Hinglish, English &amp; Japanese.
          No appointments. No fees. Instant answers.
        </p>

        {/* Expert pills */}
        <div className="welcome-expert-pills">
          {experts.map((e) => (
            <div key={e.seed} className="welcome-expert-pill">
              <img
                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${e.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&size=44`}
                alt={e.label}
              />
              <span>{e.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="welcome-cta">
          <button className="btn-primary" onClick={onStart}>
            Meet Your Experts
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          {/* Stats strip */}
          <div className="welcome-stats">
            {[['12+', 'Experts'], ['24/7', 'Available'], ['Free', 'Always']].map(([n, l]) => (
              <div key={l} className="welcome-stat-item">
                <div className="welcome-stat-num">{n}</div>
                <div className="welcome-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
