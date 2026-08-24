import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'outline' | 'ghost'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  children: ReactNode
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-accent text-bg font-bold hover:brightness-110 disabled:bg-white/[0.06] disabled:text-ink-4 disabled:hover:brightness-100',
  outline:
    'border border-white/12 text-ink-2 font-semibold hover:border-white/25 hover:text-ink',
  ghost: 'text-ink-3 font-semibold hover:text-ink',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`cursor-pointer rounded-[10px] px-4 py-2.5 text-sm transition disabled:cursor-not-allowed ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
