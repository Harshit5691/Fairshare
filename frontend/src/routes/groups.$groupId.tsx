import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchGroupDetail, ME } from '../api/group'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { CATEGORY_BY_KEY } from '../constants/categories'
import {
  applySettlementsToPair,
  computeNetBalance,
  computePairBalance,
  SETTLED_EPSILON,
} from '../lib/balances'
import { formatMoney } from '../lib/currency'
import { relativeTime } from '../lib/time'
import { useAppStore } from '../store/app'

export const Route = createFileRoute('/groups/$groupId')({
  component: GroupDetailPage,
})

function GroupDetailPage() {
  const { groupId } = Route.useParams()
  const openAddExpense = useAppStore((s) => s.openAddExpense)
  const openSettle = useAppStore((s) => s.openSettle)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => fetchGroupDetail(groupId),
  })

  if (isLoading) {
    return (
      <div className="animate-slideup mx-auto max-w-[840px]">
        <Skeleton className="h-4 w-24" />
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_1.4fr]">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <EmptyState
        emoji="⚠️"
        title="Couldn't load this group"
        message="We couldn't find or load this group. It may have been deleted."
        action={
          <Link
            to="/groups"
            className="cursor-pointer rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-bg transition hover:brightness-110"
          >
            Back to groups
          </Link>
        }
      />
    )
  }

  const { group, members, expenses, settlements } = data

  const net = computeNetBalance(expenses, ME, settlements)
  const positive = net >= 0
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0)

  const memberBalances = members
    .filter((m) => m.id !== ME)
    .map((m) => ({
      member: m,
      balance: applySettlementsToPair(
        computePairBalance(expenses, ME, m.id),
        settlements,
        ME,
        m.id,
      ),
    }))

  return (
    <div className="animate-slideup mx-auto max-w-[840px]">
      <Link
        to="/groups"
        className="text-sm font-semibold text-ink-3 transition hover:text-ink"
      >
        ← All groups
      </Link>

      <div className="mb-6 mt-4 flex flex-wrap items-center gap-4">
        <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/5 text-3xl">
          {group.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-2xl font-bold tracking-tight text-ink">
            {group.name}
          </h1>
          <div className="mt-1 text-sm font-medium text-ink-3">
            {members.length} members · {group.currency}
          </div>
        </div>
        <div className="flex flex-none gap-2">
          <button
            type="button"
            onClick={() => openSettle(group.id)}
            className="cursor-pointer rounded-[10px] border border-white/12 px-4 py-2.5 text-[13px] font-semibold text-ink-2 transition hover:border-white/25 hover:text-ink"
          >
            Settle up
          </button>
          <button
            type="button"
            onClick={() => openAddExpense(group.id)}
            className="cursor-pointer rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-bold text-bg transition hover:brightness-110"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <div>
          <div
            className={`mb-5 rounded-2xl border p-5 ${
              positive ? 'border-pos/20 bg-pos/8' : 'border-neg/20 bg-neg/8'
            }`}
          >
            <div className="text-xs font-medium text-ink-2">
              {positive ? 'You are owed overall' : 'You owe overall'}
            </div>
            <div
              className={`num mt-1 text-3xl font-bold ${positive ? 'text-pos' : 'text-neg'}`}
            >
              {formatMoney(net, group.currency, true)}
            </div>
            <div className="mt-1 text-xs font-medium text-ink-4">
              Total spent {formatMoney(totalSpent, group.currency)}
            </div>
          </div>

          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-3">
            Balances
          </div>
          <div className="flex flex-col">
            {memberBalances.map(({ member, balance }) => {
              const settled = Math.abs(balance) < SETTLED_EPSILON
              const owesYou = balance > 0

              return (
                <div
                  key={member.id}
                  className="flex items-center gap-3 border-b border-white/5 py-3 last:border-0"
                >
                  <Avatar user={member} size={36} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">
                      {member.name}
                    </div>
                    <div
                      className={`text-xs font-medium ${
                        settled ? 'text-ink-4' : owesYou ? 'text-pos' : 'text-neg'
                      }`}
                    >
                      {settled ? 'settled up' : owesYou ? 'owes you' : 'you owe'}
                    </div>
                  </div>
                  <div
                    className={`num text-sm font-semibold ${
                      settled ? 'text-ink-3' : owesYou ? 'text-pos' : 'text-neg'
                    }`}
                  >
                    {formatMoney(balance, group.currency, true)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-3">
            Expenses
          </div>

          {expenses.length === 0 ? (
            <EmptyState
              emoji="🧾"
              title="No expenses yet"
              message="Add the first expense to start tracking who owes what."
              action={
                <button
                  type="button"
                  onClick={() => openAddExpense(group.id)}
                  className="cursor-pointer rounded-[10px] bg-accent px-5 py-2.5 text-sm font-bold text-bg transition hover:brightness-110"
                >
                  Add an expense
                </button>
              }
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-white/5 bg-surface-2">
              {expenses.map((expense) => {
                const payer =
                  expense.paidBy === ME
                    ? 'You'
                    : (members.find((m) => m.id === expense.paidBy)?.name ?? '?')
                const category = CATEGORY_BY_KEY[expense.category]
                const myShare =
                  expense.splits.find((s) => s.userId === ME)?.shareAmount ?? 0
                const impact =
                  expense.paidBy === ME ? expense.amount - myShare : -myShare
                const noImpact = Math.abs(impact) < SETTLED_EPSILON

                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 border-b border-white/5 px-4 py-3.5 last:border-0"
                  >
                    <div
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-base"
                      style={{ backgroundColor: category.bgTint }}
                    >
                      {category.emoji}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-ink">
                        {expense.description}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-ink-4">
                        {payer} paid {formatMoney(expense.amount, expense.currency)}
                        {expense.splitType !== 'equal' && ` · ${expense.splitType}`}
                      </div>
                    </div>
                    <div className="flex-none text-right">
                      <div
                        className={`num text-[13px] font-semibold ${
                          noImpact ? 'text-ink-3' : impact > 0 ? 'text-pos' : 'text-neg'
                        }`}
                      >
                        {formatMoney(impact, expense.currency, true)}
                      </div>
                      <div className="mt-0.5 text-[11px] font-medium text-ink-4">
                        {relativeTime(expense.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
