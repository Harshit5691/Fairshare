import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchHome } from '../api/group'
import { AvatarStack } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { CATEGORY_BY_KEY } from '../constants/categories'
import { SETTLED_EPSILON } from '../lib/balances'
import { formatMoney } from '../lib/currency'
import { relativeTime } from '../lib/time'
import { users } from '../mock/data'
import { useAppStore } from '../store/app'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const homeCurrency = useAppStore((s) => s.homeCurrency)
  const openAddExpense = useAppStore((s) => s.openAddExpense)
  const openSettle = useAppStore((s) => s.openSettle)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home', homeCurrency],
    queryFn: () => fetchHome(homeCurrency),
  })

  if (isLoading) return <HomeSkeleton />

  if (isError || !data) {
    return (
      <EmptyState
        emoji="⚠️"
        title="Couldn't load your dashboard"
        message="Something went wrong loading your balances."
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="cursor-pointer rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-bg transition hover:brightness-110"
          >
            Try again
          </button>
        }
      />
    )
  }

  const { summary, groups, activity } = data
  const positive = summary.net >= 0

  return (
    <div className="animate-slideup">
      <section className="relative py-8 text-center">
        <div
          className="pointer-events-none absolute left-1/2 top-3 h-[200px] w-[380px] -translate-x-1/2 blur-[10px]"
          style={{
            background: `radial-gradient(closest-side, ${
              positive ? 'rgba(61,220,151,.18)' : 'rgba(255,90,95,.18)'
            }, transparent)`,
          }}
        />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
            Your net balance
          </div>
          <div
            className={`num mt-1.5 text-[clamp(2.75rem,8vw,4.125rem)] font-bold tracking-tight ${
              positive ? 'text-pos' : 'text-neg'
            }`}
          >
            {formatMoney(summary.net, homeCurrency, true)}
          </div>
          <div
            className={`mt-2.5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 ${
              positive ? 'border-pos/25 bg-pos/12' : 'border-neg/25 bg-neg/12'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${positive ? 'bg-pos' : 'bg-neg'}`}
            />
            <span
              className={`text-[13px] font-semibold ${positive ? 'text-pos' : 'text-neg'}`}
            >
              {positive
                ? `You're owed ${formatMoney(summary.net, homeCurrency)} more than you owe`
                : `You owe ${formatMoney(-summary.net, homeCurrency)} more than you're owed`}
            </span>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openAddExpense()}
              className="cursor-pointer rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-bg transition hover:brightness-110"
            >
              + Add an expense
            </button>
            <button
              type="button"
              onClick={() => openSettle()}
              className="cursor-pointer rounded-xl border border-white/15 px-6 py-3 text-sm font-semibold text-ink-2 transition hover:border-white/30 hover:text-ink"
            >
              Settle up
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-8 grid max-w-[560px] grid-cols-2 gap-3.5">
        <div className="rounded-2xl border border-white/[0.07] bg-surface px-5 py-4">
          <div className="text-xs font-medium text-ink-3">You're owed</div>
          <div className="num mt-1.5 text-2xl font-bold text-pos">
            {formatMoney(summary.owed, homeCurrency)}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-surface px-5 py-4">
          <div className="text-xs font-medium text-ink-3">You owe</div>
          <div className="num mt-1.5 text-2xl font-bold text-neg">
            {formatMoney(summary.owe, homeCurrency)}
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold uppercase tracking-wide text-ink-2">
            Your groups
          </h2>
          <Link
            to="/groups"
            className="text-[13px] font-semibold text-ink-3 transition hover:text-ink"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => {
            const settled = Math.abs(group.balance) < SETTLED_EPSILON
            const owed = group.balance > 0
            return (
              <Link
                key={group.id}
                to="/groups/$groupId"
                params={{ groupId: group.id }}
                className="rounded-2xl border border-white/[0.07] bg-surface p-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-lg">
                    {group.emoji}
                  </div>
                  <AvatarStack users={group.memberIds.map((id) => users[id])} />
                </div>
                <div className="mt-3.5 text-[15px] font-semibold text-ink">
                  {group.name}
                </div>
                <div className="mt-0.5 text-xs font-medium text-ink-4">
                  {group.memberIds.length} members · {group.currency}
                </div>
                <div
                  className={`num mt-3 text-lg font-bold ${
                    settled ? 'text-ink-3' : owed ? 'text-pos' : 'text-neg'
                  }`}
                >
                  {settled
                    ? 'settled'
                    : formatMoney(group.balance, group.currency, true)}
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3.5 text-[13px] font-semibold uppercase tracking-wide text-ink-2">
          Recent activity
        </h2>
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-2">
          {activity.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-ink-3">
              No activity yet — add your first expense.
            </div>
          ) : (
            activity.map((item) => {
              const settledImpact = Math.abs(item.impact) < SETTLED_EPSILON
              const emoji = item.category
                ? CATEGORY_BY_KEY[item.category].emoji
                : item.emoji
              const tint = item.category
                ? CATEGORY_BY_KEY[item.category].bgTint
                : 'rgba(61,220,151,.14)'

              return (
                <Link
                  key={item.id}
                  to="/groups/$groupId"
                  params={{ groupId: item.groupId }}
                  className="flex items-center gap-3.5 border-b border-white/5 px-4 py-3.5 transition last:border-0 hover:bg-white/[0.03]"
                >
                  <div
                    className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-base"
                    style={{ backgroundColor: tint }}
                  >
                    {emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">
                      {item.description}
                    </div>
                    <div className="mt-0.5 truncate text-xs font-medium text-ink-4">
                      {item.subtitle} {formatMoney(item.amount, item.currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`num text-sm font-semibold ${
                        settledImpact
                          ? 'text-ink-3'
                          : item.impact > 0
                            ? 'text-pos'
                            : 'text-neg'
                      }`}
                    >
                      {formatMoney(item.impact, item.currency, true)}
                    </div>
                    <div className="mt-0.5 text-[11px] font-medium text-ink-4">
                      {relativeTime(item.createdAt)}
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div>
      <div className="flex flex-col items-center py-8">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-3 h-16 w-64" />
        <Skeleton className="mt-3 h-8 w-80 rounded-full" />
      </div>
      <div className="mx-auto mb-8 grid max-w-[560px] grid-cols-2 gap-3.5">
        <Skeleton className="h-20 rounded-2xl" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}
