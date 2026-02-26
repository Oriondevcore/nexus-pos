// src/App.jsx
// Main app — sets up all providers, routing, and protected routes

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Context providers
import { AuthProvider, useAuth }     from './context/AuthContext'
import { ThemeProvider }             from './context/ThemeContext'
import { TenantProvider }            from './context/TenantContext'

// Components
import LoadingScreen from './components/LoadingScreen'

// Pages — Auth
import Login    from './pages/auth/Login'
import Register from './pages/auth/Register'

// Pages — App
import Home     from './pages/Home'
import Settings from './pages/Settings'
import {
  QuickSalePage,
  ClientSalePage,
  InventoryPage,
  TransactionsPage,
  ClientsPage,
} from './pages/Placeholder'

// ─── Protected route wrapper ──────────────────────────────────────────
// If user is not logged in, redirect to login
const Protected = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading)          return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// ─── Public route wrapper ─────────────────────────────────────────────
// If user IS logged in and tries to go to /login, redirect to home
const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading)         return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}

// ─── Inner app (needs useAuth, so must be inside AuthProvider) ────────
const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Public routes — only for logged-out users */}
      <Route path="/login"    element={<Public><Login    /></Public>} />
      <Route path="/register" element={<Public><Register /></Public>} />

      {/* Protected routes — only for logged-in users */}
      <Route path="/home"         element={<Protected><Home           /></Protected>} />
      <Route path="/quick-sale"   element={<Protected><QuickSalePage  /></Protected>} />
      <Route path="/client-sale"  element={<Protected><ClientSalePage /></Protected>} />
      <Route path="/inventory"    element={<Protected><InventoryPage  /></Protected>} />
      <Route path="/transactions" element={<Protected><TransactionsPage /></Protected>} />
      <Route path="/clients"      element={<Protected><ClientsPage    /></Protected>} />
      <Route path="/settings"     element={<Protected><Settings       /></Protected>} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  </BrowserRouter>
)

// ─── Root App — wraps everything in providers ─────────────────────────
const App = () => (
  <ThemeProvider>
    <AuthProvider>
      <TenantProvider>
        <AppRoutes />

        {/* Global toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background:  'var(--bg-panel)',
              color:       'var(--text-primary)',
              border:      '1px solid var(--border-gold)',
              fontFamily:  'DM Mono, monospace',
              fontSize:    '12px',
              borderRadius: '4px',
            },
          }}
        />
      </TenantProvider>
    </AuthProvider>
  </ThemeProvider>
)

export default App
