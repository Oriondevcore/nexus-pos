// src/pages/QuickSale.jsx
// Full Quick Sale flow:
// Step 1 → Amount + Description
// Step 2 → Gateway + Send Method + Contact
// Step 3 → T&Cs + Signature
// Step 4 → Animated Send + Confirmation

import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import SignatureCanvas from 'react-signature-canvas'
import toast from 'react-hot-toast'
import { useAuth }   from '../context/AuthContext'
import { useTenant } from '../context/TenantContext'
import BottomNav     from '../components/BottomNav'
import ParticleCanvas from '../components/ParticleCanvas'
import {
  createYocoCheckout,
  buildWhatsAppLink,
  buildSmsLink,
  buildEmailLink,
  formatPaymentMessage,
} from '../services/yoco'
import { saveTransaction } from '../services/transactions'

// ─── STEP INDICATOR ──────────────────────────────────────────
const StepDots = ({ current, total }) => (
  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '28px' }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width:        i === current ? '24px' : '6px',
        height:       '6px',
        borderRadius: '3px',
        background:   i <= current ? 'var(--gold)' : 'var(--border-default)',
        transition:   'all 350ms ease',
      }} />
    ))}
  </div>
)

// ─── NUMBER PAD ───────────────────────────────────────────────
const PAD_KEYS = ['1','2','3','4','5','6','7','8','9','.','0','⌫']

const NumberPad = ({ onKey }) => (
  <div style={{
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px', padding: '4px 0',
  }}>
    {PAD_KEYS.map(k => (
      <button key={k} onClick={() => onKey(k)} style={{
        height:        '64px',
        background:    k === '⌫' ? 'rgba(231,76,60,0.1)' : 'var(--bg-surface)',
        border:        `1px solid ${k === '⌫' ? 'rgba(231,76,60,0.25)' : 'var(--border-default)'}`,
        borderRadius:  '10px',
        color:         k === '⌫' ? '#e74c3c' : 'var(--text-primary)',
        fontFamily:    'Cormorant Garamond, serif',
        fontSize:      k === '⌫' ? '20px' : '28px',
        fontWeight:    300,
        cursor:        'pointer',
        transition:    'all 120ms ease',
        userSelect:    'none',
        WebkitUserSelect: 'none',
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.94)'; e.currentTarget.style.background = k === '⌫' ? 'rgba(231,76,60,0.2)' : 'var(--gold-subtle)' }}
      onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = k === '⌫' ? 'rgba(231,76,60,0.1)' : 'var(--bg-surface)' }}
      onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.94)'; e.currentTarget.style.background = k === '⌫' ? 'rgba(231,76,60,0.2)' : 'var(--gold-subtle)' }}
      onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = k === '⌫' ? 'rgba(231,76,60,0.1)' : 'var(--bg-surface)' }}
      >
        {k}
      </button>
    ))}
  </div>
)

// ─── SEND METHOD BUTTON ───────────────────────────────────────
const MethodBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} style={{
    display:       'flex',
    flexDirection: 'column',
    alignItems:    'center',
    gap:           '6px',
    padding:       '14px 8px',
    borderRadius:  '10px',
    border:        `1px solid ${active ? 'var(--gold)' : 'var(--border-default)'}`,
    background:    active ? 'var(--gold-subtle)' : 'var(--bg-surface)',
    cursor:        'pointer',
    transition:    'all 200ms ease',
    flex:          1,
    boxShadow:     active ? '0 0 16px var(--gold-glow)' : 'none',
  }}>
    <span style={{ fontSize: '22px' }}>{icon}</span>
    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: active ? 'var(--gold)' : 'var(--text-muted)' }}>
      {label}
    </span>
  </button>
)

// ─── GATEWAY BUTTON ───────────────────────────────────────────
const GatewayBtn = ({ name, label, logo, active, onClick }) => (
  <button onClick={onClick} style={{
    display:       'flex',
    alignItems:    'center',
    gap:           '10px',
    padding:       '12px 16px',
    borderRadius:  '8px',
    border:        `1px solid ${active ? 'var(--gold)' : 'var(--border-default)'}`,
    background:    active ? 'var(--gold-subtle)' : 'var(--bg-surface)',
    cursor:        'pointer',
    transition:    'all 200ms ease',
    flex:          1,
    boxShadow:     active ? '0 0 12px var(--gold-glow)' : 'none',
  }}>
    <span style={{ fontSize: '18px' }}>{logo}</span>
    <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '11px', fontWeight: 700, color: active ? 'var(--gold)' : 'var(--text-muted)' }}>
      {label}
    </span>
    {active && <span style={{ marginLeft: 'auto', color: 'var(--gold)', fontSize: '14px' }}>✓</span>}
  </button>
)

// ─── SEND ANIMATION OVERLAY ───────────────────────────────────
const SendAnimation = ({ phase }) => {
  // phase: 'sending' | 'success'
  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'var(--bg-primary)',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         200,
      padding:        '40px',
    }}>
      <ParticleCanvas count={60} opacity={0.8} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {phase === 'sending' ? (
          <>
            <div style={{
              width:        '80px', height: '80px',
              borderRadius: '50%',
              border:       '2px solid var(--border-gold)',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              margin:       '0 auto 32px',
              animation:    'spin 1.5s linear infinite',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.5">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Sending...
            </h2>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
              Generating your payment link
            </p>
          </>
        ) : (
          <>
            {/* Success ring */}
            <div style={{
              width:        '100px', height: '100px',
              borderRadius: '50%',
              background:   'linear-gradient(135deg, rgba(46,204,113,0.1), rgba(201,168,76,0.1))',
              border:       '2px solid #2ecc71',
              display:      'flex', alignItems: 'center', justifyContent: 'center',
              margin:       '0 auto 32px',
              boxShadow:    '0 0 40px rgba(46,204,113,0.3)',
              animation:    'scaleIn 0.4s ease forwards',
            }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 300, color: 'var(--gold)', marginBottom: '8px', animation: 'fadeUp 0.4s ease 0.2s forwards', opacity: 0 }}>
              Link Sent!
            </h2>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'var(--text-muted)', animation: 'fadeUp 0.4s ease 0.3s forwards', opacity: 0 }}>
              Payment link delivered successfully
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════
const QuickSale = () => {
  const navigate           = useNavigate()
  const { user }           = useAuth()
  const { branding, gateways, currency, vatRate, vatEnabled } = useTenant()

  // ── Step navigation ──────────────────────────────────
  const [step, setStep] = useState(0)  // 0=amount, 1=send, 2=sign, 3=sending/done

  // ── Step 1: Amount ────────────────────────────────────
  const [display,     setDisplay]     = useState('0')
  const [description, setDescription] = useState('')

  // ── Step 2: Send method ───────────────────────────────
  const [gateway,    setGateway]    = useState(() => {
    // Auto-select first enabled gateway
    if (gateways?.yoco?.enabled)   return 'yoco'
    if (gateways?.stripe?.enabled) return 'stripe'
    if (gateways?.mpesa?.enabled)  return 'mpesa'
    return 'yoco' // fallback — will prompt to configure
  })
  const [sendMethod, setSendMethod] = useState('whatsapp')
  const [contact,    setContact]    = useState('')  // phone or email

  // ── Step 3: T&Cs + Signature ─────────────────────────
  const [tcAccepted,  setTcAccepted]  = useState(false)
  const [sigEmpty,    setSigEmpty]    = useState(true)
  const sigRef = useRef(null)

  // ── Step 4: Sending state ─────────────────────────────
  const [sendPhase, setSendPhase] = useState(null) // null | 'sending' | 'success'
  const [txnId,     setTxnId]     = useState(null)
  const [payUrl,    setPayUrl]    = useState('')
  const [loading,   setLoading]   = useState(false)

  // ─── Number pad handler ───────────────────────────────
  const handleKey = useCallback((key) => {
    setDisplay(prev => {
      if (key === '⌫') {
        const next = prev.slice(0, -1)
        return next === '' ? '0' : next
      }
      if (key === '.' && prev.includes('.')) return prev
      if (prev === '0' && key !== '.') return key
      if (prev.includes('.')) {
        const decimals = prev.split('.')[1]
        if (decimals && decimals.length >= 2) return prev
      }
      return prev + key
    })
  }, [])

  // ─── Computed values ──────────────────────────────────
  const amount      = parseFloat(display) || 0
  const vatAmount   = vatEnabled ? (amount * vatRate) / (100 + vatRate) : 0
  const amountCents = Math.round(amount * 100)

  const fmtAmount = (val) =>
    `${currency} ${Number(val).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  // ─── Active gateways ──────────────────────────────────
  const activeGateways = Object.entries(gateways || {})
    .filter(([, g]) => g.enabled)
    .map(([name]) => name)

  const GATEWAY_INFO = {
    yoco:   { label: 'Yoco',   logo: '🟦' },
    stripe: { label: 'Stripe', logo: '🟣' },
    mpesa:  { label: 'M-Pesa', logo: '🟢' },
  }

  // ─── Validation per step ──────────────────────────────
  const canProceed = () => {
    if (step === 0) return amount > 0
    if (step === 1) {
      if (!contact.trim()) return false
      if (sendMethod === 'email') return contact.includes('@')
      return contact.replace(/\D/g, '').length >= 9
    }
    if (step === 2) return tcAccepted && !sigEmpty
    return false
  }

  // ─── Handle the actual send ───────────────────────────
  const handleSend = async () => {
    if (!canProceed()) return
    setLoading(true)
    setSendPhase('sending')
    setStep(3)

    try {
      let paymentUrl = ''
      let checkoutId = ''

      // Generate payment link
      if (gateway === 'yoco') {
        const checkout = await createYocoCheckout(amountCents, description || 'Payment')
        paymentUrl = checkout.url
        checkoutId = checkout.id
      } else {
        // For other gateways in Phase 4 — show link
        paymentUrl = `https://pay.example.com/${Date.now()}`
        checkoutId = `demo_${Date.now()}`
      }

      setPayUrl(paymentUrl)

      // Get signature image
      const sigDataUrl = sigRef.current?.isEmpty() ? null : sigRef.current?.toDataURL()

      // Save to Firestore
      const txn = await saveTransaction({
        tenantId:        user.uid,
        amount,
        amountCents,
        description,
        gateway,
        checkoutId,
        paymentUrl,
        sendMethod,
        sendTo:          contact,
        vatAmount:       vatEnabled ? vatAmount : 0,
        vatRate:         vatEnabled ? vatRate : 0,
        signatureDataUrl: sigDataUrl,
        status:          'pending',
      })
      setTxnId(txn.id)

      // Build and open the send link
      const message = formatPaymentMessage(
        branding?.businessName || 'NEXUS POS',
        amount, currency, paymentUrl, description
      )

      let sendUrl = ''
      if (sendMethod === 'whatsapp') sendUrl = buildWhatsAppLink(contact, message)
      else if (sendMethod === 'sms') sendUrl = buildSmsLink(contact, message)
      else if (sendMethod === 'email') sendUrl = buildEmailLink(contact, `Payment Request — ${fmtAmount(amount)}`, message)
      else if (sendMethod === 'qr') {
        // QR shown on success screen
      }

      if (sendUrl) window.open(sendUrl, '_blank')

      // Show success after short delay
      await new Promise(r => setTimeout(r, 1200))
      setSendPhase('success')

    } catch (err) {
      setSendPhase(null)
      setStep(2)
      setLoading(false)
      toast.error(err.message || 'Failed to send. Please try again.')
    }
  }

  // ─── Signature handlers ───────────────────────────────
  const handleSigEnd = () => {
    setSigEmpty(sigRef.current?.isEmpty() ?? true)
  }
  const clearSig = () => {
    sigRef.current?.clear()
    setSigEmpty(true)
  }

  // ─── New sale ─────────────────────────────────────────
  const newSale = () => {
    setStep(0); setDisplay('0'); setDescription(''); setContact('')
    setTcAccepted(false); setSigEmpty(true); setSendPhase(null)
    setTxnId(null); setPayUrl(''); setLoading(false)
    sigRef.current?.clear()
  }

  // ─── RENDER ───────────────────────────────────────────
  return (
    <div className="page-container">

      {/* Send animation overlay */}
      {sendPhase && <SendAnimation phase={sendPhase} />}

      {/* Success screen (after animation) */}
      {sendPhase === 'success' && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--bg-primary)', zIndex: 300, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px' }}>
          <ParticleCanvas count={50} opacity={0.9} />
          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '360px', textAlign: 'center' }}>

            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'rgba(46,204,113,0.08)', border: '2px solid #2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(46,204,113,0.25)', animation: 'scaleIn 0.4s ease' }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            </div>

            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '42px', fontWeight: 300, color: 'var(--gold)', marginBottom: '4px', animation: 'fadeUp 0.4s ease 0.1s forwards', opacity: 0 }}>
              Sent! ✓
            </h1>
            <p style={{ fontFamily: 'Syne, sans-serif', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '32px', animation: 'fadeUp 0.4s ease 0.2s forwards', opacity: 0 }}>
              Payment link delivered
            </p>

            {/* Summary card */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: '12px', padding: '24px', marginBottom: '24px', animation: 'fadeUp 0.4s ease 0.3s forwards', opacity: 0, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Amount</span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 400, color: 'var(--gold)' }}>{fmtAmount(amount)}</span>
              </div>
              {vatEnabled && (
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-default)', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>VAT ({vatRate}%) incl.</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>{fmtAmount(vatAmount)}</span>
                </div>
              )}
              {description && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>For</span>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-primary)' }}>{description}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>Via</span>
                <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-primary)', textTransform: 'capitalize' }}>{sendMethod} → {contact}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '2px', background: 'rgba(243,156,18,0.1)', border: '1px solid rgba(243,156,18,0.3)', color: '#f39c12' }}>
                  Pending Payment
                </span>
              </div>
            </div>

            {/* Copy link button */}
            {payUrl && (
              <button onClick={() => { navigator.clipboard.writeText(payUrl); toast.success('Link copied!') }}
                style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: '8px', padding: '12px', fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--gold)', cursor: 'pointer', marginBottom: '12px', animation: 'fadeUp 0.4s ease 0.4s forwards', opacity: 0 }}>
                📋 Copy Payment Link
              </button>
            )}

            <button onClick={newSale} className="btn-gold" style={{ animation: 'fadeUp 0.4s ease 0.5s forwards', opacity: 0 }}>
              ⚡ New Sale
            </button>
            <button onClick={() => navigate('/home')} className="btn-ghost" style={{ marginTop: '10px', animation: 'fadeUp 0.4s ease 0.6s forwards', opacity: 0 }}>
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="page-header">
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/home')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'DM Mono', fontSize: '12px', padding: '8px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          {step === 0 ? 'Home' : 'Back'}
        </button>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '1px' }}>
          Quick Sale
        </h1>
        <div style={{ width: '64px' }} />
      </header>

      {/* CONTENT */}
      <div style={{ padding: '20px 20px 90px', maxWidth: '480px', margin: '0 auto' }}>
        <StepDots current={step} total={3} />

        {/* ══ STEP 0 — AMOUNT ══════════════════════════════ */}
        {step === 0 && (
          <div className="animate-fade-up">

            {/* Amount display */}
            <div style={{
              background:   'var(--bg-surface)',
              border:       '1px solid var(--border-gold)',
              borderRadius: '14px',
              padding:      '28px 24px',
              textAlign:    'center',
              marginBottom: '16px',
              position:     'relative',
              overflow:     'hidden',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 0%, rgba(201,168,76,0.06), transparent 60%)', pointerEvents: 'none' }} />
              <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Enter Amount
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: 'var(--gold)', opacity: 0.7 }}>
                  {currency}
                </span>
                <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '56px', fontWeight: 300, color: 'var(--gold)', lineHeight: 1, letterSpacing: '-1px', minWidth: '120px' }}>
                  {display}
                </span>
              </div>
              {vatEnabled && amount > 0 && (
                <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                  Incl. VAT ({vatRate}%): {fmtAmount(vatAmount)}
                </p>
              )}
            </div>

            {/* Description */}
            <input
              className="input-gold"
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Description (optional — e.g. Invoice #001)"
              style={{ marginBottom: '20px' }}
            />

            {/* Number pad */}
            <NumberPad onKey={handleKey} />

            {/* Proceed */}
            <button
              className="btn-gold"
              onClick={() => setStep(1)}
              disabled={amount <= 0}
              style={{ marginTop: '20px', opacity: amount > 0 ? 1 : 0.4 }}
            >
              Continue — {fmtAmount(amount)} →
            </button>
          </div>
        )}

        {/* ══ STEP 1 — GATEWAY + SEND METHOD ═══════════════ */}
        {step === 1 && (
          <div className="animate-fade-up">

            {/* Amount summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total</span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: 'var(--gold)' }}>{fmtAmount(amount)}</span>
            </div>

            {/* Gateway selection */}
            <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Payment Gateway
            </p>

            {activeGateways.length === 0 ? (
              <div style={{ background: 'rgba(243,156,18,0.08)', border: '1px solid rgba(243,156,18,0.25)', borderRadius: '8px', padding: '14px 16px', marginBottom: '20px' }}>
                <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: '#f39c12', lineHeight: 1.6 }}>
                  ⚠️ No payment gateways enabled. Go to{' '}
                  <button onClick={() => navigate('/settings')} style={{ color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Mono', fontSize: '12px', textDecoration: 'underline' }}>
                    Settings → Gateways
                  </button>
                  {' '}to enable Yoco, Stripe, or M-Pesa.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
                {activeGateways.map(gw => (
                  <GatewayBtn key={gw} name={gw} label={GATEWAY_INFO[gw]?.label || gw} logo={GATEWAY_INFO[gw]?.logo || '💳'}
                    active={gateway === gw} onClick={() => setGateway(gw)} />
                ))}
              </div>
            )}

            {/* Send method */}
            <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Send Via
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <MethodBtn icon="💬" label="WhatsApp" active={sendMethod === 'whatsapp'} onClick={() => setSendMethod('whatsapp')} />
              <MethodBtn icon="📱" label="SMS"       active={sendMethod === 'sms'}       onClick={() => setSendMethod('sms')} />
              <MethodBtn icon="📧" label="Email"     active={sendMethod === 'email'}     onClick={() => setSendMethod('email')} />
              <MethodBtn icon="🔗" label="QR / Copy" active={sendMethod === 'qr'}       onClick={() => setSendMethod('qr')} />
            </div>

            {/* Contact input */}
            {sendMethod !== 'qr' && (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  {sendMethod === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  className="input-gold"
                  type={sendMethod === 'email' ? 'email' : 'tel'}
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                  placeholder={sendMethod === 'email' ? 'client@email.com' : '+27 82 000 0000'}
                  autoFocus
                />
              </div>
            )}

            {sendMethod === 'qr' && (
              <div style={{ marginBottom: '24px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '14px 16px' }}>
                <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  After generating the link, you'll be able to copy it or display it as a QR code for in-person payment.
                </p>
              </div>
            )}

            <button
              className="btn-gold"
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              style={{ opacity: canProceed() ? 1 : 0.4 }}
            >
              Continue to Sign →
            </button>
          </div>
        )}

        {/* ══ STEP 2 — T&Cs + SIGNATURE ════════════════════ */}
        {step === 2 && (
          <div className="animate-fade-up">

            {/* Amount summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: '10px', padding: '14px 18px', marginBottom: '24px' }}>
              <span style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Authorising</span>
              <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 300, color: 'var(--gold)' }}>{fmtAmount(amount)}</span>
            </div>

            {/* T&Cs checkbox */}
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '18px', marginBottom: '20px' }}>
              <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Terms & Conditions
              </p>
              <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
                {branding?.tcText || 'By signing, I agree to the terms and conditions of this transaction.'}
              </p>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}
                onClick={() => setTcAccepted(v => !v)}>
                <div style={{
                  width:        '20px', height: '20px', flexShrink: 0,
                  borderRadius: '4px',
                  border:       `2px solid ${tcAccepted ? 'var(--gold)' : 'var(--text-muted)'}`,
                  background:   tcAccepted ? 'var(--gold)' : 'transparent',
                  display:      'flex', alignItems: 'center', justifyContent: 'center',
                  transition:   'all 200ms', marginTop: '1px',
                }}>
                  {tcAccepted && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#080808" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                </div>
                <span style={{ fontFamily: 'DM Mono', fontSize: '12px', color: tcAccepted ? 'var(--text-primary)' : 'var(--text-muted)', lineHeight: 1.5 }}>
                  I accept the terms and conditions
                </span>
              </label>
            </div>

            {/* Signature pad */}
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                Digital Signature
              </p>
              <div style={{
                background:   'var(--bg-surface)',
                border:       `2px dashed ${sigEmpty ? 'var(--border-default)' : 'var(--gold)'}`,
                borderRadius: '10px',
                overflow:     'hidden',
                position:     'relative',
                transition:   'border-color 300ms',
              }}>
                {sigEmpty && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 1 }}>
                    <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '18px', fontStyle: 'italic', color: 'var(--text-muted)', opacity: 0.5 }}>
                      Sign here
                    </p>
                  </div>
                )}
                <SignatureCanvas
                  ref={sigRef}
                  onEnd={handleSigEnd}
                  penColor="var(--gold)"
                  canvasProps={{
                    width:  380,
                    height: 160,
                    style:  { width: '100%', height: '160px', display: 'block' },
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button onClick={clearSig} style={{ flex: 1, height: '38px', background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.2)', borderRadius: '6px', color: '#e74c3c', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', cursor: 'pointer' }}>
                  ✕ Clear
                </button>
                <div style={{ flex: 1, height: '38px', background: sigEmpty ? 'transparent' : 'rgba(46,204,113,0.08)', border: `1px solid ${sigEmpty ? 'var(--border-default)' : 'rgba(46,204,113,0.3)'}`, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'DM Mono', fontSize: '11px', color: sigEmpty ? 'var(--text-muted)' : '#2ecc71' }}>
                    {sigEmpty ? 'Not signed' : '✓ Signed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Send button */}
            <button
              className="btn-gold"
              onClick={handleSend}
              disabled={!canProceed() || loading}
              style={{ opacity: canProceed() && !loading ? 1 : 0.4, fontSize: '12px', letterSpacing: '3px' }}
            >
              🚀 Send Payment Link — {fmtAmount(amount)}
            </button>
          </div>
        )}
      </div>

      {step < 3 && <BottomNav />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scaleIn { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}

export default QuickSale
