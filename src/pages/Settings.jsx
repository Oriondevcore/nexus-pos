// src/pages/Settings.jsx
// White-label branding + gateway management + account settings

import { useState } from 'react'
import { useNavigate }        from 'react-router-dom'
import toast                  from 'react-hot-toast'
import { useAuth }            from '../context/AuthContext'
import { useTenant }          from '../context/TenantContext'
import { useTheme }           from '../context/ThemeContext'
import BottomNav              from '../components/BottomNav'

// ─── Reusable input row ──────────────────────────────────────────────
const Field = ({ label, value, onChange, type = 'text', placeholder, hint, prefix }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
      {label}
    </label>
    {prefix ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        <span style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-default)', borderRight: 'none', padding: '13px 12px', borderRadius: '4px 0 0 4px', fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'DM Mono', whiteSpace: 'nowrap' }}>
          {prefix}
        </span>
        <input className="input-gold" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{ borderRadius: '0 4px 4px 0', flex: 1 }} />
      </div>
    ) : (
      <input className="input-gold" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    )}
    {hint && <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--text-muted)', marginTop: '5px' }}>{hint}</p>}
  </div>
)

// ─── Section card ────────────────────────────────────────────────────
const Section = ({ title, badge, children }) => (
  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden' }}>
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <h3 style={{ fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', margin: 0, flex: 1 }}>{title}</h3>
      {badge && <span style={{ fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '2px', background: 'var(--gold-glow)', border: '1px solid var(--border-gold)', color: 'var(--gold)' }}>{badge}</span>}
    </div>
    <div style={{ padding: '20px' }}>{children}</div>
  </div>
)

// ─── Gateway toggle card ─────────────────────────────────────────────
const GatewayCard = ({ name, label, logo, config, onUpdate, children }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div style={{ border: `1px solid ${config.enabled ? 'var(--border-gold)' : 'var(--border-default)'}`, borderRadius: '8px', marginBottom: '10px', overflow: 'hidden', transition: 'border-color 250ms' }}>
      <div onClick={() => setExpanded(e => !e)} style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: config.enabled ? 'var(--gold-subtle)' : 'transparent', transition: 'background 250ms' }}>
        <span style={{ fontSize: '20px' }}>{logo}</span>
        <span style={{ fontFamily: 'Syne', fontSize: '12px', fontWeight: 700, letterSpacing: '1px', color: 'var(--text-primary)', flex: 1 }}>{label}</span>
        {/* Toggle */}
        <div
          onClick={e => { e.stopPropagation(); onUpdate({ enabled: !config.enabled }) }}
          style={{
            width:        '42px',
            height:       '24px',
            borderRadius: '12px',
            background:   config.enabled ? 'var(--gold)' : 'var(--bg-elevated)',
            border:       `1px solid ${config.enabled ? 'var(--gold)' : 'var(--border-default)'}`,
            position:     'relative',
            cursor:       'pointer',
            transition:   'all 250ms',
            flexShrink:   0,
          }}
        >
          <div style={{
            position:     'absolute',
            top:          '3px',
            left:         config.enabled ? '20px' : '3px',
            width:        '16px',
            height:       '16px',
            borderRadius: '50%',
            background:   config.enabled ? '#080808' : 'var(--text-muted)',
            transition:   'left 250ms',
          }} />
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 250ms', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      {expanded && (
        <div style={{ padding: '16px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-panel)' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ─── Main Settings page ──────────────────────────────────────────────
const Settings = () => {
  const navigate = useNavigate()
  const { user, logout }            = useAuth()
  const { branding, gateways, updateBranding, updateGateway, saving } = useTenant()
  const { isDark, toggleTheme }     = useTheme()

  // Local state for branding (edit locally, save on button press)
  const [b, setB] = useState(branding)
  const updateB   = (field, val) => setB(prev => ({ ...prev, [field]: val }))

  const saveBranding = async () => {
    try {
      await updateBranding(b)
      toast.success('Branding saved!', { className: 'toast-nexus' })
    } catch {
      toast.error('Failed to save. Try again.', { className: 'toast-nexus' })
    }
  }

  const saveGateway = async (name, updates) => {
    try {
      await updateGateway(name, updates)
      toast.success(`${name} settings saved!`, { className: 'toast-nexus' })
    } catch {
      toast.error('Failed to save. Try again.', { className: 'toast-nexus' })
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="page-container">

      {/* Header */}
      <header className="page-header" style={{ position: 'sticky', top: 0, zIndex: 40 }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '1px' }}>
          Settings
        </h1>
        <button onClick={toggleTheme} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--gold)' }}>
          {isDark
            ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
          }
        </button>
      </header>

      <div style={{ padding: '20px 20px 90px', maxWidth: '500px', margin: '0 auto' }}>

        {/* Account info strip */}
        <div style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.08), transparent)', border: '1px solid var(--border-gold)', borderRadius: '10px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #7a6020, #c9a84c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: '#080808', fontFamily: 'Syne', flexShrink: 0 }}>
            {user?.displayName?.[0]?.toUpperCase() || 'N'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: 'Syne', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.displayName || 'User'}
            </p>
            <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.email}
            </p>
          </div>
          <span style={{ fontFamily: 'Syne', fontSize: '9px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '2px', background: 'var(--gold-glow)', border: '1px solid var(--border-gold)', color: 'var(--gold)', flexShrink: 0 }}>
            Admin
          </span>
        </div>

        {/* ── BRANDING ──────────────────────────────────── */}
        <Section title="Business Branding" badge="White-Label">
          <Field label="Business Name"    value={b?.businessName || ''} onChange={v => updateB('businessName', v)} placeholder="Acme Enterprises" />
          <Field label="Phone Number"     value={b?.phone || ''}        onChange={v => updateB('phone', v)}        placeholder="+27 82 000 0000" />
          <Field label="Email Address"    value={b?.email || ''}        onChange={v => updateB('email', v)}        placeholder="info@business.com" type="email" />
          <Field label="VAT Number"       value={b?.vatNumber || ''}    onChange={v => updateB('vatNumber', v)}    placeholder="4123456789" hint="South African VAT registration number" />
          <Field label="Address"          value={b?.address || ''}      onChange={v => updateB('address', v)}      placeholder="123 Main Street, City, 1234" />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Terms &amp; Conditions Text
            </label>
            <textarea
              value={b?.tcText || ''}
              onChange={e => updateB('tcText', e.target.value)}
              placeholder="By signing, I agree to the terms and conditions of this transaction."
              rows={3}
              style={{ width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-default)', borderRadius: '4px', color: 'var(--text-primary)', fontFamily: 'DM Mono', fontSize: '12px', padding: '12px 14px', outline: 'none', resize: 'vertical', lineHeight: 1.6 }}
            />
          </div>

          {/* VAT toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '12px 0', borderTop: '1px solid var(--border-default)' }}>
            <div>
              <p style={{ fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>VAT Enabled</p>
              <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--text-muted)' }}>Include VAT on all transactions</p>
            </div>
            <div onClick={() => updateB('vatEnabled', !b?.vatEnabled)} style={{ width: '42px', height: '24px', borderRadius: '12px', background: b?.vatEnabled ? 'var(--gold)' : 'var(--bg-elevated)', border: `1px solid ${b?.vatEnabled ? 'var(--gold)' : 'var(--border-default)'}`, position: 'relative', cursor: 'pointer', transition: 'all 250ms', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: '3px', left: b?.vatEnabled ? '20px' : '3px', width: '16px', height: '16px', borderRadius: '50%', background: b?.vatEnabled ? '#080808' : 'var(--text-muted)', transition: 'left 250ms' }} />
            </div>
          </div>

          {b?.vatEnabled && (
            <Field label="VAT Rate (%)" value={b?.vatRate || 15} onChange={v => updateB('vatRate', Number(v))} type="number" placeholder="15" suffix="%" />
          )}

          <button className="btn-gold" onClick={saveBranding} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
            {saving ? 'Saving...' : 'Save Branding Settings'}
          </button>
        </Section>

        {/* ── PAYMENT GATEWAYS ──────────────────────────── */}
        <Section title="Payment Gateways">

          {/* Yoco */}
          <GatewayCard name="yoco" label="Yoco" logo="🟦" config={gateways?.yoco || {}} onUpdate={u => saveGateway('yoco', u)}>
            <Field label="Public Key"   value={gateways?.yoco?.publicKey || ''} onChange={v => saveGateway('yoco', { publicKey: v })} placeholder="pk_live_..." hint="Starts with pk_live_" />
            <Field label="Secret Key"   value={gateways?.yoco?.secretKey || ''} onChange={v => saveGateway('yoco', { secretKey: v })} placeholder="sk_live_..." type="password" hint="Never share this key" />
            <Field label="Payment Link URL" value={gateways?.yoco?.linkUrl || ''} onChange={v => saveGateway('yoco', { linkUrl: v })} placeholder="https://payments.yoco.com/api/checkouts" />
          </GatewayCard>

          {/* Stripe */}
          <GatewayCard name="stripe" label="Stripe" logo="🟣" config={gateways?.stripe || {}} onUpdate={u => saveGateway('stripe', u)}>
            <Field label="Public Key"   value={gateways?.stripe?.publicKey || ''} onChange={v => saveGateway('stripe', { publicKey: v })} placeholder="pk_live_..." />
            <Field label="Secret Key"   value={gateways?.stripe?.secretKey || ''} onChange={v => saveGateway('stripe', { secretKey: v })} placeholder="sk_live_..." type="password" />
          </GatewayCard>

          {/* M-Pesa */}
          <GatewayCard name="mpesa" label="M-Pesa" logo="🟢" config={gateways?.mpesa || {}} onUpdate={u => saveGateway('mpesa', u)}>
            <p style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', lineHeight: 1.6 }}>
              ⚠️ M-Pesa uses STK Push — customer receives a payment prompt on their phone. Different to link-based gateways.
            </p>
            <Field label="Consumer Key"    value={gateways?.mpesa?.consumerKey || ''}    onChange={v => saveGateway('mpesa', { consumerKey: v })}    placeholder="Your consumer key" />
            <Field label="Consumer Secret" value={gateways?.mpesa?.consumerSecret || ''} onChange={v => saveGateway('mpesa', { consumerSecret: v })} placeholder="Your consumer secret" type="password" />
            <Field label="Shortcode / Paybill" value={gateways?.mpesa?.shortcode || ''} onChange={v => saveGateway('mpesa', { shortcode: v })} placeholder="600XXX" />
          </GatewayCard>
        </Section>

        {/* ── THEME ─────────────────────────────────────── */}
        <Section title="Appearance">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Dark Mode', value: 'dark', bg: '#080808', text: '#c9a84c', border: '#7a6020' },
              { label: 'Light Mode', value: 'light', bg: '#f5f0e8', text: '#7a6020', border: '#c9a84c' },
            ].map(t => (
              <button
                key={t.value}
                onClick={t.value === 'dark' ? () => {} : toggleTheme}
                style={{ background: t.bg, border: `2px solid ${t.border}`, borderRadius: '8px', padding: '16px', cursor: 'pointer', textAlign: 'left' }}
              >
                <p style={{ fontFamily: 'Syne', fontSize: '11px', fontWeight: 700, color: t.text, letterSpacing: '1px', textTransform: 'uppercase' }}>{t.label}</p>
                <p style={{ fontFamily: 'DM Mono', fontSize: '10px', color: t.text, opacity: 0.6, marginTop: '4px' }}>{t.value === 'dark' ? 'Midnight Black' : 'Warm Parchment'}</p>
              </button>
            ))}
          </div>
        </Section>

        {/* ── DANGER ZONE ───────────────────────────────── */}
        <Section title="Account">
          <button
            onClick={handleLogout}
            className="btn-ghost"
            style={{ borderColor: 'rgba(231,76,60,0.3)', color: '#e74c3c' }}
          >
            Sign Out
          </button>
        </Section>

      </div>

      <BottomNav />
    </div>
  )
}

export default Settings
