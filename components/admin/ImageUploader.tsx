'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImageUploaderProps {
  currentUrl?: string | null
  bucket?: string
  folder?: string
  onUploaded: (url: string) => void
  label?: string
}

export function ImageUploader({
  currentUrl,
  bucket = 'media',
  folder = 'general',
  onUploaded,
  label = 'Imagen',
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    setError('')
    setUploading(true)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const filename = `${folder}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filename, file, { upsert: true })

    if (uploadError) {
      setError('Error al subir la imagen.')
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
    setPreview(data.publicUrl)
    onUploaded(data.publicUrl)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium text-gray-700">{label}</p>}

      <div
        className={cn(
          'relative flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-violet-400 hover:bg-violet-50',
          preview && 'border-solid'
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files[0]
          if (file) handleFile(file)
        }}
      >
        {preview ? (
          <div className="relative w-full">
            <Image
              src={preview}
              alt="Preview"
              width={400}
              height={225}
              className="w-full rounded-lg object-cover"
            />
            <button
              type="button"
              className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
              onClick={(e) => {
                e.stopPropagation()
                setPreview(null)
              }}
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-gray-400">
            <Upload className="h-8 w-8" />
            <p className="text-sm">Arrastrá o hacé clic para subir</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
        }}
      />

      {uploading && <p className="text-xs text-violet-600">Subiendo imagen...</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
