import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchActivity } from '../api/group'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { CATEGORY_BY_KEY } from '../constants/categories'
import { SETTLED_EPSILON } from '../lib/balances'
import { formatMoney } from '../lib/currency'
import { relativeTime } from '../lib/time'
import { useAppStore } from '../store/app'

export const Route = createFileRoute('/activity')({
  component: ActivityPage,
})

function ActivityPage() {
  const openAddExpense = useAppStore((s) => s.openAddExpense)

  const { data: activity, isLoading, isError, refetch } = useQuery({
    queryKey: ['activity'],
    queryFn: fetchActivity,
  })

  return (
    <div className="animate-slideup mx-auto max-w-[760px]">
      <h1 className="font-display mb-6 text-2xl font-bold tracking-tight text-ink">
        Activity
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-2xl" />
          ))}
        </div>
      ) : isError || !activity ? (
        <EmptyState
          emoji="⚠️"
          title="Couldn't load activity"
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
      ) : activity.length === 0 ? (
        <EmptyState
          emoji="🧾"
          title="Nothing here yet"
          message="Expenses and settlements will appear here as they happen."
          action={
            <button
              type="button"
              onClick={() => openAddExpense()}
              className="cursor-pointer rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-bg transition hover:brightness-110"
            >
              Add an expense
            </button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-2">
          {activity.map((item) => {
            const settled = Math.abs(item.impact) < SETTLED_EPSILON
            const emoji = item.category ? CATEGORY_BY_KEY[item.category].emoji : item.emoji
            const tint = item.category
              ? CATEGORY_BY_KEY[item.category].bgTint
              : 'rgba(61,220,151,.14)'

            const row = (
              <>
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
                      settled ? 'text-ink-3' : item.impact > 0 ? 'text-pos' : 'text-neg'
                    }`}
                  >
                    {formatMoney(item.impact, item.currency, true)}
                  </div>
                  <div className="mt-0.5 text-[11px] font-medium text-ink-4">
                    {relativeTime(item.createdAt)}
                  </div>
                </div>
              </>
            )

            const className =
              'flex items-center gap-3.5 border-b border-white/5 px-4 py-3.5 transition last:border-0 hover:bg-white/[0.03]'

            return item.groupId ? (
              <Link
                key={item.id}
                to="/groups/$groupId"
                params={{ groupId: item.groupId }}
                className={className}
              >
                {row}
              </Link>
            ) : (
              <div key={item.id} className={className}>
                {row}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
