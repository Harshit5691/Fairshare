import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <>
      <div className="mx-auto max-w-[1180px] px-6 md:px-10">
        <nav className="flex gap-1.5 py-5">
          <Link
            to="/"
            activeOptions={{exact: true}}
            activeProps={{className: 'bg-white/[0.07] text-ink'}}
            className='rounded-[9px] px-3.5 py-2 text-sm font-medium text-ink-3 transition hover:text-ink'
          >
            Home
          </Link>
          <Link
            to="/groups"
            activeProps={{className: 'bg-white/[0.07] text-ink'}}
            className='rounded-[9px] px-3.5 py-2 text-sm font-medium text-ink-3 transition hover:text-ink'
          >
            Groups
          </Link>
        </nav>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  )
}
