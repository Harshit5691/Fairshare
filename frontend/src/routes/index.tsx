import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: HomePage,
})

function HomePage() {
  return (
    <div className="animate-slideup">
      <div className="p-6">
        <p className="text-accent font-display text-2xl font-bold">
          Tailwind is working
        </p>
        <p className="text-ink-3 mt-2">Welcome to Fairshare</p>
      </div>
    </div>
  )
}
