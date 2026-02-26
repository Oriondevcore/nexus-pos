// src/pages/auth/Register.jsx
// Registration screen — creates new tenant account

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ParticleCanvas from '../../components/ParticleCanvas'

const Register = () => {
  const navigate              = useNavigate()
  const { register, error, setError } = useAuth()

  const [form,    setForm]    = useState({ businessName: '', displayName: '', email: '', password: '', confirm: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const update = (field, val) => { setForm(f => ({ ...f, [field]: val })); setError(null) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    if (form.password.length < 6)       { setError('Password must be at least 6 characters.'); return }

    setLoading(true)
    try {
      await register(form.email, form.password, form.businessName, form.displayName)
      navigate('/home')
    } catch {
      // Error handled in context
    } finally {
      setLoading(false)
    }
  }

  const Field = ({ label, type = 'text', field, placeholder, autoComplete }) => (
    <div>
      <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
        {label}
      </label>
      <input
        className="input-gold"
        type={type === 'password' ? (showPass ? 'text' : 'password') : type}
        value={form[field]}
        onChange={e => update(field, e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
      />
    </div>
  )

  return (
    <div style={{
      minHeight:      '100vh',
      background:     'var(--bg-primary)',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px 20px',
      position:       'relative',
      overflow:       'hidden',
    }}>
      <ParticleCanvas count={40} />

      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.04) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Card */}
      <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: '12px', padding: '40px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 300, letterSpacing: '2px', color: 'var(--text-primary)', marginBottom: '6px' }}>
            Create Account
          </h1>
          <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Start your NEXUS POS journey
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="animate-fade-in" style={{ background: 'rgba(231,76,60,0.08)', border: '1px solid rgba(231,76,60,0.3)', borderRadius: '4px', padding: '10px 14px', marginBottom: '20px', fontSize: '12px', color: '#e74c3c', fontFamily: 'DM Mono' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Business name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>
              Business Name
            </label>
            <input className="input-gold" type="text" value={form.businessName} onChange={e => update('businessName', e.target.value)} placeholder="Your Business Name" required />
          </div>

          {/* Display name */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Your Name
            </label>
            <input className="input-gold" type="text" value={form.displayName} onChange={e => update('displayName', e.target.value)} placeholder="First & Last Name" required />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Email Address
            </label>
            <input className="input-gold" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="you@business.com" autoComplete="email" required />
          </div>

          {/* Password row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Password
              </label>
              <input className="input-gold" type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)} placeholder="Min. 6 chars" required />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Confirm
              </label>
              <input className="input-gold" type={showPass ? 'text' : 'password'} value={form.confirm} onChange={e => update('confirm', e.target.value)} placeholder="Repeat" required />
            </div>
          </div>

          {/* Show password toggle */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'DM Mono' }}>
            <input type="checkbox" checked={showPass} onChange={e => setShowPass(e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
            Show passwords
          </label>

          <button className="btn-gold" type="submit" disabled={loading} style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Account...' : 'Create Account & Start'}
          </button>
        </form>

        <div className="divider-gold" style={{ margin: '24px 0' }} />

        <p style={{ textAlign: 'center', fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--gold)', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>

      <p style={{ position: 'relative', zIndex: 1, marginTop: '24px', fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
        NEXUS POS · Your data stays yours
      </p>
    </div>
  )
}

export default Register
