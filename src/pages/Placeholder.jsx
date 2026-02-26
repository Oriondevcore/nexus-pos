// src/pages/Placeholder.jsx
// Temporary placeholder for screens being built in Phase 2 & 3

import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const Placeholder = ({ title, phase, description, icon }) => {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <header className="page-header">
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 300, color: 'var(--text-primary)', letterSpacing: '1px' }}>
          {title}
        </h1>
        <div style={{ width: 32 }} />
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 40px', textAlign: 'center', minHeight: 'calc(100vh - 60px - 72px)' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>{icon || '🚧'}</div>

        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 300, color: 'var(--text-primary)', marginBottom: '8px' }}>
          {title}
        </h2>

        <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '16px' }}>
          Coming in Phase {phase}
        </p>

        <p style={{ fontFamily: 'DM Mono', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '280px' }}>
          {description}
        </p>

        <div style={{ marginTop: '32px', padding: '16px 24px', background: 'var(--bg-surface)', border: '1px solid var(--border-gold)', borderRadius: '8px' }}>
          <p style={{ fontFamily: 'Syne', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)' }}>
            Blueprint Ready
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}

// Export named placeholders for each Phase 2/3 screen
export const QuickSalePage    = () => <Placeholder title="Quick Sale"    phase={2} icon="⚡" description="Enter amount, pick a gateway, send payment link via WhatsApp, SMS or Email. Digital signature included." />
export const ClientSalePage   = () => <Placeholder title="Client Sale"   phase={2} icon="👤" description="Select a client, add inventory items, apply VAT and discounts, generate PDF invoice." />
export const InventoryPage    = () => <Placeholder title="Inventory"     phase={3} icon="📦" description="Manage products, categories, stock levels, images, cost vs sell price." />
export const TransactionsPage = () => <Placeholder title="Transactions"  phase={2} icon="📋" description="Full transaction history with real-time payment status, resend links, export." />
export const ClientsPage      = () => <Placeholder title="Clients"       phase={3} icon="👥" description="Client database — create, search, edit clients. Auto-populate on Client Sale." />

export default Placeholder
