// src/pages/Transactions.jsx
// Full transaction history with status badges, filters, resend capability

import { useState, useEffect } from 'react'
import { useNavigate }          from 'react-router-dom'
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'
import { db }        from '../firebase'
import { useAuth }   from '../context/AuthContext'
import { useTenant } from '../context/TenantContext'
import BottomNav     from '../components/BottomNav'

const STATUS_CONFIG = {
  paid:    { bg: 'rgba(46,204,113,0.1)',  border: 'rgba(46,204,113,0.3)',  text: '#2ecc71', label: 'Paid',    dot: '#2ecc71' },
  pending: { bg: 'rgba(243,156,18,0.1)', border: 'rgba(243,156,18,0.3)', text: '#f39c12', label: 'Pending', dot: '#f39c12' },
  failed:  { bg: 'rgba(231,76,60,0.1)',  border: 'rgba(231,76,60,0.3)',  text: '#e74c3c', label: 'Failed',  dot: '#e74c3c' },
  expired: { bg: 'rgba(85,85,85,0.1)',   border: 'rgba(85,85,85,0.3)',   text: '#888',    label: 'Expired', dot: '#888' },
}

const SEND_ICON = { whatsapp: '💬', sms: '📱', email: '📧', qr: '🔗' }

const fmt = (amount, symbol = 'R') =>
  `${symbol} ${Number(amount || 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const Transactions = () => {
  const navigate         = useNavigate()
  const { user }         = useAuth()
  const { currency }     = useTenant()

  const [transactions, setTransactions] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filter,       setFilter]       = useState('all') // all | pending | paid | failed
  const [selected,     setSelected]     = useState(null)  // expanded transaction

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'transactions'),
      where('tenantId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    )
    const unsub = onSnapshot(q, (snap) => {
      setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [user])

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.status === filter)

  const totals = {
    all:     transactions.length,
    pending: transactions.filter(t => t.status === 'pending').length,
    paid:    transactions.filter(t => t.status === 'paid').length,
    failed:  transactions.filter(t => t.status === 'failed').length,
  }

  const totalPaid    = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + (t.amount || 0), 0)
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((s, t) => s + (t.amount || 0), 0)

  const formatDate = (ts) => {
    if (!ts?.toDate) return '—'
    const d = ts.toDate()
    const now = new Date()
    const diff = (now - d) / 1000
    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="page-container">

      {/* Header */}
      <header className="page-header">
        <button onClick={() => navigate('/home')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Mono', fontSize: '12px', padding: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Home
        </button>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '1px' }}>
          Transactions
        </h1>
        <div style={{ width: '64px' }} />
      </header>

      <div style={{ padding: '16px 20px 90px', maxWidth: '480px', margin: '0 auto' }}>

        {/* Revenue summary */}
        <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.2)', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#2ecc71', marginBottom: '6px', opacity: 0.8 }}>Collected</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#2ecc71' }}>{fmt(totalPaid, currency)}</p>
          </div>
          <div style={{ background: 'rgba(243,156,18,0.06)', border: '1px solid rgba(243,156,18,0.2)', borderRadius: '10px', padding: '16px' }}>
            <p style={{ fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#f39c12', marginBottom: '6px', opacity: 0.8 }}>Pending</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 400, color: '#f39c12' }}>{fmt(totalPending, currency)}</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="animate-fade-up" style={{ display: 'flex', gap: '2px', background: 'var(--bg-surface)', borderRadius: '8px', padding: '4px', marginBottom: '16px', border: '1px solid var(--border-default)' }}>
          {['all', 'pending', 'paid', 'failed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              flex:          1,
              height:        '32px',
              borderRadius:  '6px',
              border:        'none',
              background:    filter === f ? 'var(--bg-elevated)' : 'transparent',
              color:         filter === f ? 'var(--gold)' : 'var(--text-muted)',
              fontFamily:    'Syne, sans-serif',
              fontSize:      '9px',
              fontWeight:    700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              cursor:        'pointer',
              transition:    'all 200ms',
              boxShadow:     filter === f ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            }}>
              {f} {totals[f] > 0 && <span style={{ opacity: 0.6 }}>({totals[f]})</span>}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--border-gold)', borderTopColor: 'var(--gold)', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>Loading transactions...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-up" style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px dashed var(--border-default)' }}>
            <p style={{ fontSize: '36px', marginBottom: '12px' }}>📋</p>
            <p style={{ fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              No {filter === 'all' ? '' : filter} transactions
            </p>
            <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>
              {filter === 'all' ? 'Start with a Quick Sale' : `No ${filter} transactions yet`}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/quick-sale')} className="btn-gold" style={{ marginTop: '20px', width: 'auto', padding: '12px 24px' }}>
                ⚡ Quick Sale
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map((t, i) => {
              const s    = STATUS_CONFIG[t.status] || STATUS_CONFIG.pending
              const open = selected === t.id

              return (
                <div key={t.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms`, opacity: 0 }}
                >
                  {/* Main row */}
                  <div
                    onClick={() => setSelected(open ? null : t.id)}
                    style={{
                      background:   'var(--bg-surface)',
                      border:       `1px solid ${open ? 'var(--border-gold)' : 'var(--border-default)'}`,
                      borderRadius: open ? '10px 10px 0 0' : '10px',
                      padding:      '14px 16px',
                      display:      'flex',
                      alignItems:   'center',
                      gap:          '12px',
                      cursor:       'pointer',
                      transition:   'all 200ms',
                    }}
                  >
                    {/* Status dot */}
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.dot, flexShrink: 0, boxShadow: `0 0 6px ${s.dot}` }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--text-primary)', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {t.clientName || t.description || 'Quick Sale'}
                      </p>
                      <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {formatDate(t.createdAt)}
                        <span style={{ opacity: 0.4 }}>·</span>
                        <span style={{ textTransform: 'capitalize' }}>{SEND_ICON[t.sendMethod] || '💳'} {t.gateway}</span>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 400, color: 'var(--text-primary)', marginBottom: '4px', lineHeight: 1 }}>
                        {fmt(t.amount, currency)}
                      </p>
                      <span style={{ fontFamily: 'Syne', fontSize: '8px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '2px 7px', borderRadius: '2px', background: s.bg, border: `1px solid ${s.border}`, color: s.text }}>
                        {s.label}
                      </span>
                    </div>

                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 250ms' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </div>

                  {/* Expanded detail */}
                  {open && (
                    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-gold)', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '16px' }}>
                      {/* Detail rows */}
                      {[
                        ['Description', t.description || '—'],
                        ['Sent to',     `${SEND_ICON[t.sendMethod] || ''} ${t.sendTo || '—'}`],
                        ['Gateway',     t.gateway || '—'],
                        t.vatAmount > 0 && ['VAT incl.', fmt(t.vatAmount, currency)],
                        ['Created',     t.createdAt?.toDate?.()?.toLocaleString('en-ZA') || '—'],
                        ['Txn ID',      t.checkoutId || t.id],
                      ].filter(Boolean).map(([label, value]) => (
                        <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-default)' }}>
                          <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{label}</span>
                          <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-primary)', maxWidth: '60%', textAlign: 'right', wordBreak: 'break-all' }}>{value}</span>
                        </div>
                      ))}

                      {/* Signature preview */}
                      {t.signatureDataUrl && (
                        <div style={{ marginTop: '12px' }}>
                          <p style={{ fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Signature</p>
                          <img src={t.signatureDataUrl} alt="Signature" style={{ width: '100%', maxHeight: '80px', objectFit: 'contain', background: 'var(--bg-surface)', borderRadius: '4px', border: '1px solid var(--border-default)', padding: '4px' }} />
                        </div>
                      )}

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                        {t.paymentUrl && (
                          <button
                            onClick={() => { navigator.clipboard.writeText(t.paymentUrl); }}
                            style={{ flex: 1, height: '36px', background: 'var(--gold-subtle)', border: '1px solid var(--border-gold)', borderRadius: '6px', color: 'var(--gold)', fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
                          >
                            📋 Copy Link
                          </button>
                        )}
                        {t.paymentUrl && (
                          <button
                            onClick={() => window.open(t.paymentUrl, '_blank')}
                            style={{ flex: 1, height: '36px', background: 'transparent', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'var(--text-muted)', fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}
                          >
                            🔗 Open Link
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Transactions
