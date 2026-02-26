// src/pages/auth/Login.jsx
// Login screen — midnight black, metallic gold, particle atmosphere

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ParticleCanvas from '../../components/ParticleCanvas'

const Login = () => {
  const navigate           = useNavigate()
  const { login, error, setError } = useAuth()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      await login(email, password)
      navigate('/home')
    } catch {
      // Error is set by AuthContext
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:       '100vh',
      background:      'var(--bg-primary)',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '24px 20px',
      position:        'relative',
      overflow:        'hidden',
    }}>
      {/* Particle background */}
      <ParticleCanvas count={45} />

      {/* Ambient glow orb */}
      <div style={{
        position:  'absolute',
        top:       '-20%',
        left:      '50%',
        transform: 'translateX(-50%)',
        width:     '400px',
        height:    '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Card */}
      <div
        className="animate-fade-up"
        style={{
          position:     'relative',
          zIndex:       1,
          width:        '100%',
          maxWidth:     '380px',
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-gold)',
          borderRadius: '12px',
          padding:      '40px 32px',
          boxShadow:    '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.1)',
        }}
      >
        {/* Logo + Title */}
        <div className="animate-fade-up" style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width:        '52px',
            height:       '52px',
            borderRadius: '50%',
            border:       '1.5px solid rgba(201,168,76,0.5)',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            margin:       '0 auto 20px',
            background:   'rgba(201,168,76,0.05)',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.5">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>

          <h1 style={{
            fontFamily:    'Cormorant Garamond, serif',
            fontSize:      '36px',
            fontWeight:    300,
            letterSpacing: '2px',
            color:         'var(--text-primary)',
            lineHeight:    1,
            marginBottom:  '6px',
          }}>
            NEXUS <span style={{
              background: 'linear-gradient(135deg, #7a6020, #c9a84c, #f0c040)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>POS</span>
          </h1>

          <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Sign in to your account
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="animate-fade-in" style={{
            background:   'rgba(231,76,60,0.08)',
            border:       '1px solid rgba(231,76,60,0.3)',
            borderRadius: '4px',
            padding:      '10px 14px',
            marginBottom: '20px',
            fontSize:     '12px',
            color:        '#e74c3c',
            fontFamily:   'DM Mono',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              className="input-gold"
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                className="input-gold"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setError(null) }}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
              >
                {showPass
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            className="btn-gold"
            type="submit"
            disabled={loading}
            style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                Signing In...
              </span>
            ) : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div className="divider-gold" style={{ margin: '24px 0' }} />

        {/* Links */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ fontFamily: 'DM Mono', fontSize: '12px', color: 'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: 500 }}>
              Create one
            </Link>
          </p>
          <Link to="/forgot-password" style={{ fontFamily: 'DM Mono', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none' }}>
            Forgot your password?
          </Link>
        </div>
      </div>

      {/* Footer */}
      <p style={{ position: 'relative', zIndex: 1, marginTop: '24px', fontFamily: 'DM Mono', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
        NEXUS POS · Secure · Encrypted
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default Login
