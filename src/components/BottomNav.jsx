// src/components/BottomNav.jsx
// Mobile-style bottom navigation bar

import { useNavigate, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  {
    path:  '/home',
    label: 'Home',
    icon:  ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    path:  '/quick-sale',
    label: 'Quick',
    icon:  ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    path:  '/client-sale',
    label: 'Sale',
    center: true,
    icon:  ({ active }) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.5 : 2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    path:  '/inventory',
    label: 'Stock',
    icon:  ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    path:  '/settings',
    label: 'Settings',
    icon:  ({ active }) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
]

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav style={{
      position:       'fixed',
      bottom:         0,
      left:           0,
      right:          0,
      height:         '72px',
      background:     'var(--bg-secondary)',
      borderTop:      '1px solid var(--border-default)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'space-around',
      zIndex:         100,
      paddingBottom:  'env(safe-area-inset-bottom)',
      backdropFilter: 'blur(20px)',
    }}>
      {NAV_ITEMS.map((item) => {
        const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

        // Centre "Sale" button — bigger, gold circle
        if (item.center) {
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                width:        '56px',
                height:       '56px',
                borderRadius: '50%',
                background:   active
                  ? 'linear-gradient(135deg, #7a6020, #c9a84c, #f0c040, #c9a84c)'
                  : 'linear-gradient(135deg, #1a1a1a, #242424)',
                border:       `2px solid ${active ? '#c9a84c' : 'rgba(201,168,76,0.3)'}`,
                color:        active ? '#080808' : '#c9a84c',
                cursor:       'pointer',
                display:      'flex',
                alignItems:   'center',
                justifyContent: 'center',
                boxShadow:    active ? '0 0 20px rgba(201,168,76,0.4)' : '0 2px 8px rgba(0,0,0,0.5)',
                transition:   'all 250ms ease',
                transform:    'translateY(-8px)',
                flexShrink:   0,
              }}
            >
              <item.icon active={active} />
            </button>
          )
        }

        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display:        'flex',
              flexDirection:  'column',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '4px',
              background:     'none',
              border:         'none',
              cursor:         'pointer',
              color:          active ? 'var(--gold)' : 'var(--text-muted)',
              padding:        '8px 12px',
              transition:     'color 200ms ease, transform 150ms ease',
              transform:      active ? 'scale(1.05)' : 'scale(1)',
              minWidth:       '52px',
            }}
          >
            <item.icon active={active} />
            <span style={{
              fontFamily:    'Syne, sans-serif',
              fontSize:      '9px',
              fontWeight:    700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              marginTop:     '2px',
            }}>
              {item.label}
            </span>
            {active && (
              <span style={{
                position:     'absolute',
                bottom:       '8px',
                width:        '4px',
                height:       '4px',
                borderRadius: '50%',
                background:   'var(--gold)',
                boxShadow:    '0 0 6px var(--gold)',
              }} />
            )}
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
