'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { slugify } from '@/lib/utils'

export default function NewCoursePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    currency: 'ARS',
    cover_image: '',
    is_published: false,
    is_featured: false,
    discount_price: '',
    offer_label: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTitleChange(title: string) {
    setForm((f) => ({ ...f, title, slug: slugify(title) }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const supabase = createClient()
    const { data, error: err } = await supabase
      .from('courses')
      .insert({
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        price: parseFloat(form.price),
        currency: form.currency,
        cover_image: form.cover_image || null,
        is_published: form.is_published,
        is_featured: form.is_featured,
        discount_price: form.discount_price ? parseFloat(form.discount_price) : null,
        offer_label: form.offer_label || null,
      })
      .select('id')
      .single()

    setSaving(false)

    if (err) {
      setError(err.message)
      return
    }

    router.push(`/admin/courses/${data.id}`)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nuevo curso</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <Input
          label="Título"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          required
          placeholder="Ej: Manejo de la ansiedad"
        />

        <Input
          label="Slug (URL)"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          required
          placeholder="manejo-de-la-ansiedad"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            placeholder="Descripción del curso..."
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              label="Precio"
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
              min="0"
              step="0.01"
              placeholder="15000"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Moneda</label>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <ImageUploader
          label="Imagen de portada"
          folder="courses"
          currentUrl={form.cover_image}
          onUploaded={(url) => setForm((f) => ({ ...f, cover_image: url }))}
        />

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">Oferta y destacado</p>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                label="Precio con descuento (opcional)"
                type="number"
                value={form.discount_price}
                onChange={(e) => setForm((f) => ({ ...f, discount_price: e.target.value }))}
                min="0"
                step="0.01"
                placeholder="Ej: 7500"
              />
            </div>
            <div className="flex-1">
              <Input
                label="Etiqueta de oferta (opcional)"
                value={form.offer_label}
                onChange={(e) => setForm((f) => ({ ...f, offer_label: e.target.value }))}
                placeholder="Ej: 50% OFF"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_featured}
              onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
              className="accent-amber-500"
            />
            <span className="text-sm text-gray-700">Destacar este curso en el inicio</span>
          </label>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
            className="accent-violet-600"
          />
          <span className="text-sm text-gray-700">Publicar inmediatamente</span>
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="submit" loading={saving}>Crear curso</Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </div>
  )
}
