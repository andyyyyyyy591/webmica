'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { createClient } from '@/lib/supabase/client'
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content?: Record<string, unknown> | null
  onChange: (json: Record<string, unknown>) => void
  lessonId?: string
  placeholder?: string
}

export function RichTextEditor({ content, onChange, lessonId, placeholder = 'Escribí el contenido aquí...' }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
    ],
    content: content ?? undefined,
    onUpdate({ editor }) {
      onChange(editor.getJSON() as Record<string, unknown>)
    },
  })

  async function uploadImage() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file || !editor) return

      const supabase = createClient()
      const folder = lessonId ? `lessons/${lessonId}` : 'content'
      const filename = `${folder}/${Date.now()}-${file.name}`

      const { error } = await supabase.storage.from('media').upload(filename, file, { upsert: true })
      if (error) return alert('Error al subir imagen')

      const { data } = supabase.storage.from('media').getPublicUrl(filename)
      editor.chain().focus().setImage({ src: data.publicUrl }).run()
    }
    input.click()
  }

  function setLink() {
    const url = window.prompt('URL del enlace:')
    if (!url || !editor) return
    editor.chain().focus().setLink({ href: url }).run()
  }

  if (!editor) return null

  const ToolbarBtn = ({
    active,
    onClick,
    children,
    title,
  }: {
    active?: boolean
    onClick: () => void
    children: React.ReactNode
    title?: string
  }) => (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={cn(
        'rounded p-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors',
        active && 'bg-violet-100 text-violet-700'
      )}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded-xl border border-gray-300 overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 p-2">
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrita">
          <Bold className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Cursiva">
          <Italic className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarBtn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Título 2">
          <Heading2 className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Título 3">
          <Heading3 className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista">
          <List className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Cita">
          <Quote className="h-4 w-4" />
        </ToolbarBtn>
        <div className="mx-1 h-5 w-px bg-gray-300" />
        <ToolbarBtn active={editor.isActive('link')} onClick={setLink} title="Enlace">
          <LinkIcon className="h-4 w-4" />
        </ToolbarBtn>
        <ToolbarBtn onClick={uploadImage} title="Imagen">
          <ImageIcon className="h-4 w-4" />
        </ToolbarBtn>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 focus:outline-none min-h-48 [&_.tiptap]:outline-none [&_.tiptap_p.is-editor-empty:first-child::before]:text-gray-400 [&_.tiptap_p.is-editor-empty:first-child::before]:float-left [&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  )
}
