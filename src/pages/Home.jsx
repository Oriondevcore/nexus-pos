// src/pages/Home.jsx
// Main dashboard — revenue overview, quick actions, recent transactions

import { useState, useEffect } from 'react'
import { useNavigate }          from 'react-router-dom'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'
import { db }                   from '../firebase'
import { useAuth }              from '../context/AuthContext'
import { useTenant }            from '../context/TenantContext'
import { useTheme }             from '../context/ThemeContext'
import BottomNav                from '../components/BottomNav'
import ParticleCanvas           from '../components/ParticleCanvas'

// Format currency
const fmt = (amount, symbol = 'R') =>
  `${symbol} ${Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

// Status badge colours
const STATUS = {
  paid:    { bg: 'rgba(46,204,113,0.1)',  border: 'rgba(46,204,113,0.3)',  text: '#2ecc71', label: 'Paid' },
  pending: { bg: 'rgba(243,156,18,0.1)', border: 'rgba(243,156,18,0.3)', text: '#f39c12', label: 'Pending' },
  failed:  { bg: 'rgba(231,76,60,0.1)',  border: 'rgba(231,76,60,0.3)',  text: '#e74c3c', label: 'Failed' },
  expired: { bg: 'rgba(85,85,85,0.1)',   border: 'rgba(85,85,85,0.3)',   text: '#888888', label: 'Expired' },
}

const Home = () => {
  const navigate            = useNavigate()
  const { user, userDoc, logout } = useAuth()
  const { branding, currency }  = useTenant()
  const { isDark, toggleTheme } = useTheme()

  const [transactions, setTransactions] = useState([])
  const [stats, setStats]               = useState({ today: 0, pending: 0, paid: 0 })
  const [period, setPeriod]             = useState('today') // today | week | month
  const [greeting, setGreeting]         = useState('')

  // Time-based greeting
  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good Morning')
    else if (h < 17) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
  }, [])

  // Listen to recent transactions in real time
  useEffect(() => {
    if (!user) return

    const q = query(
      collection(db, 'transactions'),
      where('tenantId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(10)
    )

    const unsub = onSnapshot(q, (snap) => {
      const txns = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setTransactions(txns)

      // Calculate stats
      const now    = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      const todayTxns = txns.filter(t => t.createdAt?.toDate() >= todayStart)
      const todayPaid = todayTxns.filter(t => t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0)
      const allPending = txns.filter(t => t.status === 'pending').reduce((s, t) => s + (t.amount || 0), 0)
      const allPaid    = txns.filter(t => t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0)

      setStats({ today: todayPaid, pending: allPending, paid: allPaid })
    })

    return unsub
  }, [user])

  const name = userDoc?.displayName?.split(' ')[0] || 'there'

  return (
    <div className="page-container">
      <ParticleCanvas count={25} opacity={0.5} />

      {/* Header */}
      <header style={{
        position:     'relative',
        zIndex:       10,
        padding:      '20px 20px 0',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
            {greeting}
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', fontWeight: 400, color: 'var(--text-primary)', letterSpacing: '1px' }}>
            {name} 👋
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Theme toggle */}
          <button onClick={toggleTheme} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gold)', transition: 'all 200ms' }}>
            {isDark
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            }
          </button>

          {/* Notification placeholder */}
          <button style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)', border: '1.5px solid var(--bg-primary)' }} />
          </button>
        </div>
      </header>

      <div style={{ position: 'relative', zIndex: 5, padding: '24px 20px', paddingBottom: '90px', maxWidth: '500px', margin: '0 auto' }}>

        {/* ── REVENUE HERO CARD ─────────────────────────── */}
        <div className="animate-fade-up card-gold animate-glow" style={{ borderRadius: '12px', padding: '28px 24px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
          {/* Period selector */}
          <div style={{ display: 'flex', gap: '2px', marginBottom: '20px' }}>
            {['today', 'week', 'month'].map(p => (
              <button key={p} onClick={() => setPeriod(p)} style={{
                fontFamily:    'Syne, sans-serif',
                fontSize:      '9px',
                fontWeight:    700,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                padding:       '5px 12px',
                borderRadius:  '2px',
                border:        'none',
                cursor:        'pointer',
                background:    period === p ? 'var(--gold-glow)' : 'transparent',
                color:         period === p ? 'var(--gold)' : 'var(--text-muted)',
                borderBottom:  period === p ? '1px solid var(--gold)' : '1px solid transparent',
                transition:    'all 200ms',
              }}>
                {p}
              </button>
            ))}
          </div>

          <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Revenue
          </p>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '44px', fontWeight: 300, color: 'var(--gold)', letterSpacing: '-1px', lineHeight: 1, marginBottom: '4px' }}>
            {fmt(stats.today, currency)}
          </h2>
          <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
            {transactions.filter(t => t.status === 'paid').length} paid transactions
          </p>
        </div>

        {/* ── STATS ROW ─────────────────────────────────── */}
        <div className="animate-fade-up delay-100" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' }}>
          {[
            { label: 'Pending',  value: fmt(stats.pending, currency), color: '#f39c12', bg: 'rgba(243,156,18,0.08)', border: 'rgba(243,156,18,0.2)' },
            { label: 'All-Time Paid', value: fmt(stats.paid, currency), color: '#2ecc71', bg: 'rgba(46,204,113,0.08)', border: 'rgba(46,204,113,0.2)' },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '8px', padding: '16px' }}>
              <p style={{ fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: s.color, marginBottom: '6px', opacity: 0.8 }}>{s.label}</p>
              <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── QUICK ACTIONS ─────────────────────────────── */}
        <div className="animate-fade-up delay-200" style={{ marginBottom: '28px' }}>
          <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
            Quick Actions
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Quick Sale',   icon: '⚡', path: '/quick-sale',  primary: true },
              { label: 'Client Sale',  icon: '👤', path: '/client-sale', primary: false },
              { label: 'Inventory',    icon: '📦', path: '/inventory',   primary: false },
              { label: 'Transactions', icon: '📋', path: '/transactions',primary: false },
            ].map(a => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                style={{
                  background:    a.primary ? 'linear-gradient(135deg, #7a6020, #c9a84c, #f0c040, #c9a84c)' : 'var(--bg-surface)',
                  border:        a.primary ? 'none' : '1px solid var(--border-default)',
                  borderRadius:  '8px',
                  padding:       '18px 14px',
                  cursor:        'pointer',
                  textAlign:     'left',
                  transition:    'all 200ms ease',
                  color:         a.primary ? '#080808' : 'var(--text-primary)',
                }}
                onMouseEnter={e => { if (!a.primary) e.currentTarget.style.borderColor = 'rgba(201,168,76,0.4)' }}
                onMouseLeave={e => { if (!a.primary) e.currentTarget.style.borderColor = 'var(--border-default)' }}
              >
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{a.icon}</div>
                <p style={{ fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{a.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── RECENT TRANSACTIONS ───────────────────────── */}
        <div className="animate-fade-up delay-300">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Recent
            </p>
            <button onClick={() => navigate('/transactions')} style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer' }}>
              View All →
            </button>
          </div>

          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px dashed var(--border-default)' }}>
              <p style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</p>
              <p style={{ fontFamily: 'Syne', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>No transactions yet</p>
              <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Start with a Quick Sale</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {transactions.slice(0, 6).map(t => {
                const s = STATUS[t.status] || STATUS.pending
                return (
                  <div key={t.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 200ms' }}>
                    <div>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '3px' }}>
                        {t.clientName || 'Quick Sale'}
                      </p>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--text-muted)' }}>
                        {t.createdAt?.toDate?.()?.toLocaleDateString('en-ZA') || '—'} · {t.gateway || 'Yoco'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {fmt(t.amount, currency)}
                      </p>
                      <span style={{ fontFamily: 'Syne', fontSize: '8px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '2px', background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  )
}

export default Home
