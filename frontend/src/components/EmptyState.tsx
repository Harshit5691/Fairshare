import type React from "react"

type EmptyStateProps = {
    emoji?: string
    title: string
    message?: string
    action?: React.ReactNode
}

export function EmptyState({emoji = '📭', title, message, action}: EmptyStateProps){
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-white/10 bg-surface-2 px-6 py-16 text-center">
            <div className="text-5xl mb-4">{emoji}</div>
            <div className="font-display text-lg font-bold text-ink">{title}</div>
            {message && <div className="mt-2 max-w-sm text-sm text-ink-3">{message}</div>}
            {action && <div className="mt-6">{action}</div>}
        </div>
    )
}