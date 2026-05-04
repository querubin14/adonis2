'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Credentials provided by the user
    if (email === 'querubin2414@gmail.com' && password === 'cherembo') {
      // Set a simple cookie (not secure for production, but fits the request)
      document.cookie = "admin_session=true; path=/; max-age=86400" // 24 hours
      router.push('/admin')
    } else {
      setError('Credenciales incorrectas')
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-body">
      <div className="max-w-md w-full bg-surface-container-low border border-outline-variant/10 p-10">
        <div className="text-center mb-8">
          <h1 className="font-headline text-2xl tracking-[0.25em] text-white uppercase mb-2">ADONIS</h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Acceso Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-[9px] tracking-[0.2em] text-neutral-500 uppercase mb-2 font-bold">Contraseña</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b border-neutral-800 text-white text-sm py-2.5 outline-none focus:border-white transition-colors"
              required
            />
          </div>

          {error && (
            <p className="text-error text-[10px] font-bold uppercase tracking-wider text-center">{error}</p>
          )}

          <button 
            type="submit"
            className="w-full bg-white text-black py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  )
}
