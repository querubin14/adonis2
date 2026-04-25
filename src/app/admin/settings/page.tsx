'use client'

import { useState, useEffect } from 'react'
import { getSettings, updateSettings } from '@/lib/data'
import { StoreSettings } from '@/lib/types'
import { toast } from 'react-toastify'

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const data = await getSettings()
      if (data) {
        setSettings(data)
      } else {
        // Provide empty defaults if nothing exists
        setSettings({
          id: '00000000-0000-0000-0000-000000000001',
          favicon_url: '',
          instagram_url: '',
          tiktok_url: '',
          whatsapp_number: '',
          address_footer: '',
          top_bar_text: '',
          blog_visible: true,
          blog_title: '',
          blog_subtitle: '',
          blog_button_text: '',
          blog_button_link: '',
          shipping_text: '',
          returns_text: ''
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings(prev => prev ? {
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    } : null)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    try {
      await updateSettings(settings)
      toast.success('Configuración guardada correctamente', { theme: 'dark' })
    } catch (error) {
      console.error(error)
      toast.error('Error al guardar la configuración', { theme: 'dark' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <span className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!settings) return null

  return (
    <div className="p-8 max-w-4xl font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2 font-headline">Configuración General</h1>
        <p className="text-sm text-neutral-400">Redes sociales y datos de contacto.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Identidad de Marca */}
        <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-8">
          <h2 className="text-lg font-bold text-white mb-6 font-headline">Identidad de Marca</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                FAVICON / ICONO DE NAVEGADOR
              </label>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  name="favicon_url"
                  value={settings.favicon_url || ''} 
                  onChange={handleChange}
                  placeholder="URL del Favicon..."
                  className="flex-grow bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors placeholder:text-neutral-700" 
                />
              </div>
              <p className="text-[9px] text-neutral-600 mt-2">Recomendado: PNG o ICO con fondo transparente.</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                INSTAGRAM URL
              </label>
              <input 
                type="text" 
                name="instagram_url"
                value={settings.instagram_url || ''} 
                onChange={handleChange}
                placeholder="https://instagram.com/..."
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                TIKTOK URL
              </label>
              <input 
                type="text" 
                name="tiktok_url"
                value={settings.tiktok_url || ''} 
                onChange={handleChange}
                placeholder="https://tiktok.com/@..."
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                WHATSAPP (NÚMERO O LINK COMPLETO)
              </label>
              <input 
                type="text" 
                name="whatsapp_number"
                value={settings.whatsapp_number || ''} 
                onChange={handleChange}
                placeholder="595993220180"
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                DIRECCIÓN / FOOTER INFO
              </label>
              <input 
                type="text" 
                name="address_footer"
                value={settings.address_footer || ''} 
                onChange={handleChange}
                placeholder="Luque Paraguay"
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>
          </div>
        </section>

        {/* Encabezado */}
        <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-8">
          <h2 className="text-lg font-bold text-white mb-6 font-headline">Encabezado (Top Bar)</h2>
          
          <div>
            <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
              TEXTO DEL ENCABEZADO
            </label>
            <input 
              type="text" 
              name="top_bar_text"
              value={settings.top_bar_text || ''} 
              onChange={handleChange}
              placeholder="ENVIOS A TODO PY"
              className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
            />
          </div>
        </section>

        {/* Home Blog Section & Product Info */}
        <section className="bg-[#0a0a0a] border border-neutral-800 rounded-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white font-headline">Sección Lifestyle / Blog (Home)</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">Visible:</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  name="blog_visible"
                  checked={settings.blog_visible} 
                  onChange={handleChange}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-white/20"></div>
              </label>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                TÍTULO DE SECCIÓN
              </label>
              <input 
                type="text" 
                name="blog_title"
                value={settings.blog_title || ''} 
                onChange={handleChange}
                placeholder="ADONIS STORE"
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                SUBTÍTULO
              </label>
              <input 
                type="text" 
                name="blog_subtitle"
                value={settings.blog_subtitle || ''} 
                onChange={handleChange}
                placeholder="Únete a la comunidad..."
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                  TEXTO BOTÓN
                </label>
                <input 
                  type="text" 
                  name="blog_button_text"
                  value={settings.blog_button_text || ''} 
                  onChange={handleChange}
                  placeholder="LEER EL BLOG"
                  className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                  LINK BOTÓN
                </label>
                <input 
                  type="text" 
                  name="blog_button_link"
                  value={settings.blog_button_link || ''} 
                  onChange={handleChange}
                  placeholder="/blog"
                  className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
                />
              </div>
            </div>
            
            <hr className="border-neutral-800 my-8" />

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                TEXTO DE ENVÍO (INFO PRODUCTO)
              </label>
              <input 
                type="text" 
                name="shipping_text"
                value={settings.shipping_text || ''} 
                onChange={handleChange}
                placeholder="Envío gratis en compras mayores a 500.000 Gs"
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold tracking-widest text-neutral-500 uppercase mb-2">
                TEXTO DE DEVOLUCIONES (INFO PRODUCTO)
              </label>
              <input 
                type="text" 
                name="returns_text"
                value={settings.returns_text || ''} 
                onChange={handleChange}
                placeholder="Devoluciones gratis hasta 30 días"
                className="w-full bg-[#000000] border border-neutral-800 rounded-md text-white text-sm py-3 px-4 outline-none focus:border-neutral-500 transition-colors" 
              />
            </div>
          </div>
        </section>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-white text-black py-4 text-[12px] font-black uppercase tracking-widest hover:bg-neutral-200 transition-all rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving && <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />}
          {saving ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
        </button>
      </form>
    </div>
  )
}
