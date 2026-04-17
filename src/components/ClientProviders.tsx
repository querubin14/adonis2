'use client'

import { CartProvider } from '@/context/CartContext'
import { FavoritesProvider } from '@/context/FavoritesContext'
import CartSidebar from '@/components/CartSidebar'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <FavoritesProvider>
      <CartProvider>
        {children}
        <CartSidebar />
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar
          closeButton={false}
          newestOnTop
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover={false}
          theme="dark"
          style={{ top: '1rem' }}
          toastStyle={{
            background: '#1c1b1b',
            color: '#e5e2e1',
            border: '1px solid #2a2a2a',
            borderRadius: '0px',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
            minHeight: '44px',
          }}
        />
      </CartProvider>
    </FavoritesProvider>
  )
}
