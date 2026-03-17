'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/admin/ImageUploader'

const IMAGE_SLOTS = [
  { key: 'hero', label: 'Hero principal (banner de inicio)', folder: 'site' },
  { key: 'banner1', label: 'Banner secundario', folder: 'site' },
]

export default function ImagesAdminPage() {
  const [urls, setUrls] = useState<Record<string, string>>({})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de imágenes</h1>
        <p className="text-sm text-gray-500 mt-1">
          Subí o reemplazá las imágenes del sitio. Los cambios se reflejan de inmediato.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {IMAGE_SLOTS.map((slot) => (
          <div key={slot.key} className="rounded-xl border border-gray-200 bg-white p-5">
            <ImageUploader
              label={slot.label}
              folder={slot.folder}
              currentUrl={urls[slot.key]}
              onUploaded={(url) => setUrls((prev) => ({ ...prev, [slot.key]: url }))}
            />
            {urls[slot.key] && (
              <p className="mt-2 truncate text-xs text-gray-400">{urls[slot.key]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 font-semibold text-gray-900">Subir imagen personalizada</h2>
        <ImageUploader
          label="Imagen libre"
          folder="uploads"
          onUploaded={(url) => {
            navigator.clipboard?.writeText(url)
            alert('URL copiada al portapapeles: ' + url)
          }}
        />
        <p className="mt-2 text-xs text-gray-400">
          La URL se copiará automáticamente al portapapeles para usarla donde quieras.
        </p>
      </div>
    </div>
  )
}
