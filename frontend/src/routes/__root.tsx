import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AddExpenseModal } from '../components/AddExpenseModal'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { SettleModal } from '../components/SettleModal'
import { Toaster } from '../components/Toaster'
import { users } from '../mock/data'
import { useAppStore } from '../store/app'

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

const NAV: { to: string; label: string; exact?: boolean }[] = [
  { to: '/', label: 'Home', exact: true },
  { to: '/groups', label: 'Groups' },
  { to: '/friends', label: 'Friends' },
  { to: '/activity', label: 'Activity' },
  { to: '/insights', label: 'Insights' },
]

function RootLayout() {
  const openAddExpense = useAppStore((s) => s.openAddExpense)

  return (
    <>
      <div className="mx-auto flex min-h-screen max-w-[1180px] flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-white/[0.06] bg-bg/85 px-6 py-4 backdrop-blur-lg md:px-10">
          <Link to="/" className="flex flex-none items-center gap-2.5">
            <div className="font-display flex h-6.5 w-6.5 items-center justify-center rounded-[7px] bg-accent text-sm font-bold text-bg">
              t
            </div>
            <div className="font-display text-lg font-bold tracking-tight text-ink">
              Tally
            </div>
          </Link>

          <nav className="flex flex-1 justify-center gap-1.5 overflow-x-auto">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={item.exact ? { exact: true } : undefined}
                activeProps={{ className: 'bg-white/[0.07] text-ink' }}
                className="flex-none rounded-[9px] px-3.5 py-2 text-sm font-medium text-ink-3 transition hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-none items-center gap-3">
            <button
              type="button"
              onClick={() => openAddExpense()}
              className="cursor-pointer rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-bold text-bg transition hover:brightness-110"
            >
              + Add expense
            </button>
            <Link to="/settings">
              <Avatar user={users.me} size={38} />
            </Link>
          </div>
        </header>

        <main className="flex-1 px-6 pb-16 pt-8 md:px-10">
          <Outlet />
        </main>
      </div>

      <AddExpenseModal />
      <SettleModal />
      <Toaster />

      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  )
}

function NotFound() {
  return (
    <div className="mx-auto max-w-[1180px] px-6 py-20 md:px-10">
      <EmptyState
        emoji="🧭"
        title="Page not found"
        message="That page doesn't exist. It may have moved, or the link was mistyped."
        action={
          <Link
            to="/"
            className="cursor-pointer rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-bg transition hover:brightness-110"
          >
            Back home
          </Link>
        }
      />
    </div>
  )
}
