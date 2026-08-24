import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchInsights, type CategoryTotal, type MonthlyPoint } from '../api/group'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { seriesColor } from '../constants/chartColors'
import { formatMoney } from '../lib/currency'
import { useAppStore } from '../store/app'
import type { CurrencyCode } from '../types'

export const Route = createFileRoute('/insights')({
  component: InsightsPage,
})

function InsightsPage() {
  const homeCurrency = useAppStore((s) => s.homeCurrency)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['insights', homeCurrency],
    queryFn: () => fetchInsights(homeCurrency),
  })

  if (isLoading) {
    return (
      <div className="animate-slideup">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="mt-4 h-72 rounded-2xl" />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        emoji="⚠️"
        title="Couldn't load insights"
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

  const { summary, totalTracked, expenseCount, byCategory, byGroup, monthly } = data
  const positive = summary.net >= 0

  return (
    <div className="animate-slideup">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Insights
      </h1>
      <p className="mb-6 mt-1 text-[13px] font-medium text-ink-3">
        Your spending and balances, converted to {homeCurrency}.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Net balance"
          value={formatMoney(summary.net, homeCurrency, true)}
          tone={positive ? 'pos' : 'neg'}
          note={positive ? 'in your favour' : 'you owe overall'}
        />
        <StatTile
          label="You're owed"
          value={formatMoney(summary.owed, homeCurrency)}
          tone="pos"
          note="across all groups"
        />
        <StatTile
          label="You owe"
          value={formatMoney(summary.owe, homeCurrency)}
          tone="neg"
          note="across all groups"
        />
        <StatTile
          label="Total tracked"
          value={formatMoney(totalTracked, homeCurrency)}
          note={`${expenseCount} expenses`}
        />
      </div>

      <div className="mb-4">
        <MonthlyChart points={monthly} currency={homeCurrency} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryChart categories={byCategory} currency={homeCurrency} />
        <GroupChart groups={byGroup} currency={homeCurrency} />
      </div>
    </div>
  )
}

function StatTile({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: string
  note: string
  tone?: 'pos' | 'neg'
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-surface p-4">
      <div className="text-xs font-medium text-ink-3">{label}</div>
      <div
        className={`num mt-1.5 text-[22px] font-bold ${
          tone === 'pos' ? 'text-pos' : tone === 'neg' ? 'text-neg' : 'text-ink'
        }`}
      >
        {value}
      </div>
      <div className="mt-1 text-[11px] font-medium text-ink-4">{note}</div>
    </div>
  )
}

function MonthlyChart({
  points,
  currency,
}: {
  points: MonthlyPoint[]
  currency: CurrencyCode
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const max = Math.max(...points.map((p) => p.total), 1)
  const total = points.reduce((sum, p) => sum + p.total, 0)

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-surface-2 p-5">
      <div className="mb-1 text-sm font-semibold text-ink">Monthly spending</div>
      <div className="num mb-5 text-2xl font-bold text-ink">
        {formatMoney(total, currency)}{' '}
        <span className="text-xs font-medium text-ink-3">past 12 months</span>
      </div>

      <div className="flex h-44 items-end gap-2">
        {points.map((point, i) => {
          const heightPct = (point.total / max) * 100
          const active = hovered === i

          return (
            <div
              key={`${point.label}-${i}`}
              className="relative flex h-full flex-1 flex-col justify-end gap-2"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {active && (
                <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-ink shadow-xl">
                  {point.label}: {formatMoney(point.total, currency)}
                </div>
              )}
              <div
                className="w-full rounded-t transition-all"
                style={{
                  height: `${Math.max(heightPct, point.total > 0 ? 2 : 0)}%`,
                  background: active ? '#5598e7' : '#3987e5',
                  minHeight: point.total > 0 ? 3 : 0,
                }}
              />
              <div className="text-center text-[10px] font-medium text-ink-4">
                {point.label}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CategoryChart({
  categories,
  currency,
}: {
  categories: CategoryTotal[]
  currency: CurrencyCode
}) {
  if (categories.length === 0) {
    return (
      <section className="rounded-2xl border border-white/[0.07] bg-surface-2 p-5">
        <div className="mb-4 text-sm font-semibold text-ink">By category</div>
        <p className="text-sm text-ink-3">No expenses yet.</p>
      </section>
    )
  }

  const max = Math.max(...categories.map((c) => c.total), 1)

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-surface-2 p-5">
      <div className="mb-5 text-sm font-semibold text-ink">By category</div>

      <div className="flex flex-col gap-3.5">
        {categories.map((entry, i) => (
          <div key={entry.category}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 flex-none rounded-sm"
                  style={{ background: seriesColor(i) }}
                />
                <span className="text-[13px] font-medium text-ink-2">
                  {entry.category}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="num text-[13px] font-semibold text-ink">
                  {formatMoney(entry.total, currency)}
                </span>
                <span className="num text-[11px] font-medium text-ink-4">
                  {entry.pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(entry.total / max) * 100}%`,
                  background: seriesColor(i),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function GroupChart({
  groups,
  currency,
}: {
  groups: { groupId: string; name: string; emoji: string; total: number }[]
  currency: CurrencyCode
}) {
  const max = Math.max(...groups.map((g) => g.total), 1)

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-surface-2 p-5">
      <div className="mb-1 text-sm font-semibold text-ink">Spending by group</div>
      <p className="mb-5 text-xs font-medium text-ink-4">
        Total spent per group, converted to {currency}.
      </p>

      <div className="flex flex-col gap-4">
        {groups.map((group, i) => (
          <div key={group.groupId}>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium text-ink-2">
                {group.emoji} {group.name}
              </span>
              <span className="num text-[13px] font-semibold text-ink">
                {formatMoney(group.total, currency)}
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(group.total / max) * 100}%`,
                  background: seriesColor(i),
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
