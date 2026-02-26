// src/context/TenantContext.jsx
// Manages the current tenant's white-label branding and settings

import { createContext, useContext, useEffect, useState } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'

const TenantContext = createContext(null)

export const useTenant = () => {
  const ctx = useContext(TenantContext)
  if (!ctx) throw new Error('useTenant must be used inside TenantProvider')
  return ctx
}

export const TenantProvider = ({ children }) => {
  const { user, userDoc }  = useAuth()
  const [branding, setBranding]   = useState(null)
  const [gateways, setGateways]   = useState(null)
  const [saving, setSaving]       = useState(false)

  // Load from userDoc whenever it changes
  useEffect(() => {
    if (userDoc) {
      setBranding(userDoc.branding || defaultBranding)
      setGateways(userDoc.gateways || defaultGateways)
    }
  }, [userDoc])

  // ─── Update branding settings ─────────────────────────────────────
  const updateBranding = async (updates) => {
    if (!user) return
    setSaving(true)
    try {
      const merged = { ...branding, ...updates }
      setBranding(merged) // Optimistic update (UI updates immediately)
      await updateDoc(doc(db, 'tenants', user.uid), {
        branding:  merged,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to save branding:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // ─── Update a specific gateway config ────────────────────────────
  const updateGateway = async (gatewayName, updates) => {
    if (!user) return
    setSaving(true)
    try {
      const merged = {
        ...gateways,
        [gatewayName]: { ...gateways[gatewayName], ...updates }
      }
      setGateways(merged)
      await updateDoc(doc(db, 'tenants', user.uid), {
        gateways:  merged,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.error('Failed to save gateway:', err)
      throw err
    } finally {
      setSaving(false)
    }
  }

  // ─── Get active gateway ───────────────────────────────────────────
  const activeGateways = gateways
    ? Object.entries(gateways).filter(([, g]) => g.enabled).map(([name]) => name)
    : []

  const defaultGateway = activeGateways[0] || null

  const value = {
    branding:       branding || defaultBranding,
    gateways:       gateways || defaultGateways,
    saving,
    updateBranding,
    updateGateway,
    activeGateways,
    defaultGateway,
    // Convenience getters
    businessName:   branding?.businessName || 'NEXUS POS',
    currency:       branding?.currencySymbol || 'R',
    vatRate:        branding?.vatRate || 15,
    vatEnabled:     branding?.vatEnabled ?? true,
  }

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  )
}

// ─── Default values ────────────────────────────────────────────────
const defaultBranding = {
  primaryColor:   '#c9a84c',
  logoUrl:        null,
  businessName:   'My Business',
  vatNumber:      '',
  address:        '',
  phone:          '',
  email:          '',
  tcText:         'By signing, I agree to the terms and conditions of this transaction.',
  vatEnabled:     true,
  vatRate:        15,
  currency:       'ZAR',
  currencySymbol: 'R',
}

const defaultGateways = {
  yoco:   { enabled: false, publicKey: '', secretKey: '', linkUrl: 'https://payments.yoco.com/api/checkouts' },
  stripe: { enabled: false, publicKey: '', secretKey: '' },
  mpesa:  { enabled: false, consumerKey: '', consumerSecret: '', shortcode: '' },
}
