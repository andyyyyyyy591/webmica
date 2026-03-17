'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ImageUploader } from '@/components/admin/ImageUploader'
import { Badge } from '@/components/ui/badge'
import type { Course } from '@/types/database'

export default function EditCoursePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    price: '',
    currency: 'ARS',
    cover_image: '',
    is_published: false,
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('courses').select('*').eq('id', id).single()
      if (data) {
        setCourse(data)
        setForm({
          title: data.title,
          slug: data.slug,
          description: data.description ?? '',
          price: String(data.price),
          currency: data.currency,
          cover_image: data.cover_image ?? '',
          is_published: data.is_published,
        })
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const { error: err } = await supabase
      .from('courses')
      .update({
        title: form.title,
        slug: form.slug,
        description: form.description || null,
        price: parseFloat(form.price),
        currency: form.currency,
        cover_image: form.cover_image || null,
        is_published: form.is_published,
      })
      .eq('id', id)

    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setCourse((c) => c ? { ...c, is_published: form.is_published } : c)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este curso? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    await supabase.from('courses').delete().eq('id', id)
    router.push('/admin/courses')
  }

  async function togglePublish() {
    const newValue = !form.is_published
    setForm((f) => ({ ...f, is_published: newValue }))
    await supabase.from('courses').update({ is_published: newValue }).eq('id', id)
  }

  if (!course) return <div className="text-gray-400">Cargando...</div>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Editar curso</h1>
          <Badge variant={form.is_published ? 'success' : 'default'} className="mt-1">
            {form.is_published ? 'Publicado' : 'Borrador'}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={togglePublish}>
            {form.is_published ? 'Despublicar' : 'Publicar'}
          </Button>
          <Link href={`/admin/courses/${id}/curriculum`}>
            <Button variant="secondary">Editar contenido</Button>
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-gray-200 bg-white p-6">
        <Input
          label="Título"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
        />

        <Input
          label="Slug (URL)"
          value={form.slug}
          onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Descripción</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={4}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
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

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-3">
            <Button type="submit" loading={saving}>Guardar cambios</Button>
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
          </div>
          <Button type="button" variant="danger" loading={deleting} onClick={handleDelete}>
            Eliminar curso
          </Button>
        </div>
      </form>
    </div>
  )
}
