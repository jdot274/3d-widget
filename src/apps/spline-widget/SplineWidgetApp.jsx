import React from 'react';
import Spline from '@splinetool/react-spline';
export default function SplineWidgetApp({ onBack }) {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'transparent', position: 'relative' }}>
      {/* Transparent Back to Home button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: 'rgba(255,255,255,0.15)',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '10px 22px',
          fontSize: 18,
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          zIndex: 10,
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(59,146,255,0.18)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
      >
        ← Back to Home
      </button>
      <Spline scene="https://prod.spline.design/cdYlcyhiet7laxaI/scene.splinecode" />
    </div>
  );
} 