import React, { useEffect, useRef, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const videoRef = useRef(null);
  const [showSkip, setShowSkip] = useState(false);
  const [hasVideo, setHasVideo] = useState(true);

  useEffect(() => {
    // Show skip button after 2.5s in case video is slow
    const t = setTimeout(() => setShowSkip(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const handleVideoEnd = () => onFinish();
  const handleVideoError = () => {
    setHasVideo(false);
    // If no video, show animated splash then auto-dismiss after 3s
    setTimeout(onFinish, 3000);
  };

  return (
    <div className="splash-screen">
      {hasVideo ? (
        <video
          ref={videoRef}
          src="/splash.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          onError={handleVideoError}
          className="splash-video"
        />
      ) : (
        <AnimatedSplash />
      )}

      {showSkip && (
        <button className="splash-skip" onClick={onFinish}>
          Skip
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      )}
    </div>
  );
}

function AnimatedSplash() {
  return (
    <div className="splash-animated">
      <div className="splash-blob splash-blob-1" />
      <div className="splash-blob splash-blob-2" />
      <div className="splash-logo-wrap">
        <div className="splash-logo-ring">
          <svg width="52" height="52" viewBox="0 0 44 44" fill="none">
            <path d="M22 6C13.163 6 6 13.163 6 22c0 5.8 3.1 10.9 7.7 13.7V38l8.3-3.8 8.3 3.8v-2.3C34.9 32.9 38 27.8 38 22 38 13.163 30.837 6 22 6z" fill="white" opacity="0.95"/>
            <rect x="19" y="15" width="6" height="14" rx="2" fill="rgba(99,102,241,0.7)"/>
            <rect x="15" y="19" width="14" height="6" rx="2" fill="rgba(99,102,241,0.7)"/>
          </svg>
        </div>
        <div className="splash-app-name">Talk To Expert</div>
        <div className="splash-tagline">Your AI Expert, Always Available</div>
      </div>
      <div className="splash-loader">
        <div className="splash-bar" />
      </div>
    </div>
  );
}
