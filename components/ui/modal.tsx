'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-xl bg-white p-6 shadow-2xl',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            className
          )}
        >
          {title && (
            <div className="mb-4 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
              <Dialog.Close asChild>
                <button className="rounded-md p-1 text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </Dialog.Close>
            </div>
          )}
          {!title && (
            <Dialog.Close asChild>
              <button className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          )}
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
