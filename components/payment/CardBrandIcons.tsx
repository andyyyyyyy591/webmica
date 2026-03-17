export function CardBrandIcons() {
  return (
    <div className="flex items-center gap-2">
      {/* Visa */}
      <svg viewBox="0 0 48 16" className="h-5 w-auto" aria-label="Visa">
        <text x="0" y="13" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="14" fill="#1A1F71">VISA</text>
      </svg>
      {/* Mastercard */}
      <svg viewBox="0 0 38 24" className="h-6 w-auto" aria-label="Mastercard">
        <circle cx="13" cy="12" r="11" fill="#EB001B" />
        <circle cx="25" cy="12" r="11" fill="#F79E1B" />
        <path d="M19 5.27A11 11 0 0 1 23.73 12 11 11 0 0 1 19 18.73 11 11 0 0 1 14.27 12 11 11 0 0 1 19 5.27z" fill="#FF5F00" />
      </svg>
      {/* Amex */}
      <svg viewBox="0 0 48 16" className="h-5 w-auto" aria-label="American Express">
        <rect width="48" height="16" rx="2" fill="#2E77BC" />
        <text x="4" y="12" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="9" fill="white">AMEX</text>
      </svg>
    </div>
  )
}
