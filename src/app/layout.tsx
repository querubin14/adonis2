import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'Adonis Jewelry',
  description: 'Exquisite jewelry for the modern era',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${montserrat.variable} antialiased`}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  )
}
