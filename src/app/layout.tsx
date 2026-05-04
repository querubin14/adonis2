import type { Metadata } from 'next'
import { Montserrat, Antonio } from 'next/font/google'
import './globals.css'
import ClientProviders from '@/components/ClientProviders'
import WhatsAppButton from '@/components/WhatsAppButton'
import FloatingCartButton from '@/components/FloatingCartButton'
import { getSettings } from '@/lib/data'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
})

const antonio = Antonio({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-antonio',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings()
  return {
    title: {
      default: 'ADONIS STORE',
      template: '%s | ADONIS STORE',
    },
    description: 'Exquisite jewelry for the modern era',
    icons: {
      icon: [
        { url: settings?.favicon_url || '/favicon.png', sizes: 'any' },
        { url: settings?.favicon_url || '/favicon.png', sizes: '192x192', type: 'image/png' },
        { url: settings?.favicon_url || '/favicon.png', sizes: '512x512', type: 'image/png' },
      ],
      apple: settings?.favicon_url || '/favicon.png',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()
  const whatsapp = settings?.whatsapp_number || null

  return (
    <html lang="es" className="light">

      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body className={`${montserrat.variable} ${antonio.variable} antialiased`}>
        <ClientProviders>
          {children}
          <WhatsAppButton number={whatsapp} />
          <FloatingCartButton />
        </ClientProviders>
      </body>
    </html>
  )
}
