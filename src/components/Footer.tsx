import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="w-full border-t border-neutral-800/30 bg-neutral-950 flex flex-col items-center py-20 px-8 gap-8">
      <div className="text-white font-serif tracking-widest text-2xl uppercase">ADONIS GALLERY</div>
      <div className="flex flex-wrap justify-center gap-12">
        <Link 
          href="/sustainability" 
          className="font-sans text-[10px] tracking-[0.1em] uppercase text-neutral-500 hover:text-white transition-colors"
        >
          Sustentabilidad
        </Link>
        <Link 
          href="/shipping" 
          className="font-sans text-[10px] tracking-[0.1em] uppercase text-neutral-500 hover:text-white transition-colors"
        >
          Envíos
        </Link>
        <Link 
          href="/contact" 
          className="font-sans text-[10px] tracking-[0.1em] uppercase text-neutral-500 hover:text-white transition-colors"
        >
          Contacto
        </Link>
        <Link 
          href="/legal" 
          className="font-sans text-[10px] tracking-[0.1em] uppercase text-neutral-500 hover:text-white transition-colors"
        >
          Legal
        </Link>
      </div>
      <div className="flex gap-8 mt-4">
        <span className="material-symbols-outlined text-neutral-500 hover:text-white cursor-pointer">share</span>
        <span className="material-symbols-outlined text-neutral-500 hover:text-white cursor-pointer">mail</span>
        <span className="material-symbols-outlined text-neutral-500 hover:text-white cursor-pointer">location_on</span>
      </div>
      <div className="font-sans text-[10px] tracking-[0.1em] uppercase text-neutral-400 mt-8">
        © {new Date().getFullYear()} ADONIS GALLERY. TODOS LOS DERECHOS RESERVADOS.
      </div>
    </footer>
  )
}
