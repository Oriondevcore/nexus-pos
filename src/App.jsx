// src/App.jsx  ← REPLACE YOUR EXISTING FILE WITH THIS
// Wires in the real Phase 2 pages (QuickSale + Transactions)

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider }          from './context/ThemeContext'
import { TenantProvider }         from './context/TenantContext'

import LoadingScreen  from './components/LoadingScreen'

// Auth pages
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// ✅ PHASE 1 pages
import Home     from './pages/Home'
import Settings from './pages/Settings'

// ✅ PHASE 2 pages  (REAL — no longer placeholders)
import QuickSale    from './pages/QuickSale'
import Transactions from './pages/Transactions'

// Still placeholders (Phase 3)
import { ClientSalePage, InventoryPage, ClientsPage } from './pages/Placeholder'

// ─── Route guards ──────────────────────────────────────────
const Protected = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading)          return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading)         return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}

const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/"             element={<Navigate to="/home" replace />} />
      <Route path="/login"        element={<Public><Login    /></Public>} />
      <Route path="/register"     element={<Public><Register /></Public>} />

      <Route path="/home"         element={<Protected><Home           /></Protected>} />
      <Route path="/quick-sale"   element={<Protected><QuickSale      /></Protected>} />
      <Route path="/client-sale"  element={<Protected><ClientSalePage /></Protected>} />
      <Route path="/inventory"    element={<Protected><InventoryPage  /></Protected>} />
      <Route path="/transactions" element={<Protected><Transactions   /></Protected>} />
      <Route path="/clients"      element={<Protected><ClientsPage    /></Protected>} />
      <Route path="/settings"     element={<Protected><Settings       /></Protected>} />

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </BrowserRouter>
)

const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <TenantProvider>
        <AppRoutes />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background:   'var(--bg-panel)',
              color:        'var(--text-primary)',
              border:       '1px solid var(--border-gold)',
              fontFamily:   'DM Mono, monospace',
              fontSize:     '12px',
              borderRadius: '4px',
            },
          }}
        />
      </TenantProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default App
