export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm font-semibold text-violet-600">Webmica</p>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
