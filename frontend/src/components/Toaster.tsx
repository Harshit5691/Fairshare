import { useEffect } from 'react'
import { useAppStore, type Toast } from '../store/app'

const TOAST_MS = 2600

function ToastRow({ toast }: { toast: Toast }) {
  const dismissToast = useAppStore((s) => s.dismissToast)

  useEffect(() => {
    const timer = setTimeout(() => dismissToast(toast.id), TOAST_MS)
    return () => clearTimeout(timer)
  }, [toast.id, dismissToast])

  const isError = toast.tone === 'error'

  return (
    <div
      className={`animate-slideup flex items-center gap-2.5 rounded-xl border px-5 py-3 text-sm font-semibold text-ink shadow-2xl ${
        isError
          ? 'border-neg/30 bg-[#1a1114]'
          : 'border-pos/30 bg-[#1a1d26]'
      }`}
    >
      <span className={isError ? 'text-neg' : 'text-pos'}>{isError ? '!' : '✓'}</span>
      {toast.message}
    </div>
  )
}

export function Toaster() {
  const toasts = useAppStore((s) => s.toasts)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-7 left-1/2 z-[80] flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <ToastRow key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
