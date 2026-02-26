// src/components/LoadingScreen.jsx
// Full-screen loading screen shown while Firebase auth initialises

import ParticleCanvas from './ParticleCanvas'

const LoadingScreen = () => (
  <div style={{
    position:       'fixed',
    inset:          0,
    background:     'var(--bg-primary)',
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    zIndex:         9999,
  }}>
    <ParticleCanvas count={30} opacity={0.6} />

    <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
      {/* Logo mark */}
      <div style={{
        width:        '64px',
        height:       '64px',
        borderRadius: '50%',
        border:       '2px solid rgba(201,168,76,0.4)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'center',
        margin:       '0 auto 24px',
        animation:    'glowPulse 2s ease-in-out infinite',
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>

      <h1 style={{
        fontFamily:    'Cormorant Garamond, serif',
        fontSize:      '32px',
        fontWeight:    300,
        letterSpacing: '4px',
        color:         'var(--text-primary)',
        marginBottom:  '4px',
      }}>
        NEXUS
      </h1>

      <p style={{
        fontFamily:    'Syne, sans-serif',
        fontSize:      '10px',
        fontWeight:    700,
        letterSpacing: '4px',
        textTransform: 'uppercase',
        color:         'var(--gold)',
        marginBottom:  '40px',
      }}>
        POINT OF SALE
      </p>

      {/* Animated loading dots */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width:        '6px',
            height:       '6px',
            borderRadius: '50%',
            background:   'var(--gold)',
            animation:    `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>

    <style>{`
      @keyframes bounce {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
        40%           { transform: scale(1);   opacity: 1; }
      }
    `}</style>
  </div>
)

export default LoadingScreen
