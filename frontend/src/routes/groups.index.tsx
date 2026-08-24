import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchGroups } from '../api/group'
import { AvatarStack } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { SETTLED_EPSILON } from '../lib/balances'
import { formatMoney } from '../lib/currency'
import { users } from '../mock/data'
import { useAppStore } from '../store/app'

export const Route = createFileRoute('/groups/')({
  component: GroupsPage,
})

function GroupsPage() {
  const pushToast = useAppStore((s) => s.pushToast)

  const { data: groups, isLoading, isError, refetch } = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  })

  return (
    <div className="animate-slideup">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Groups
        </h1>
        <button
          type="button"
          onClick={() => pushToast('Creating groups is not wired up yet')}
          className="cursor-pointer rounded-[10px] border border-white/12 px-4 py-2.5 text-[13px] font-semibold text-ink-2 transition hover:border-white/25 hover:text-ink"
        >
          + New group
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface p-5"
            >
              <Skeleton className="h-12 w-12 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-2 h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : isError || !groups ? (
        <EmptyState
          emoji="⚠️"
          title="Couldn't load your groups"
          message="Something went wrong fetching your groups. Check your connection and try again."
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
      ) : groups.length === 0 ? (
        <EmptyState
          emoji="👋"
          title="No groups yet"
          message="Create a group to start splitting expenses with friends."
        />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {groups.map((group) => {
            const settled = Math.abs(group.balance) < SETTLED_EPSILON
            const owed = group.balance > 0

            return (
              <Link
                key={group.id}
                to="/groups/$groupId"
                params={{ groupId: group.id }}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-surface p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]"
              >
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/5 text-2xl">
                  {group.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-semibold text-ink">
                    {group.name}
                  </div>
                  <div className="mt-1 text-xs font-medium text-ink-4">
                    {group.memberIds.length} members · {group.currency}
                  </div>
                  <div className="mt-2">
                    <AvatarStack users={group.memberIds.map((id) => users[id])} />
                  </div>
                </div>
                <div className="flex-none text-right">
                  {settled ? (
                    <div className="num text-base font-bold text-ink-3">settled</div>
                  ) : (
                    <>
                      <div
                        className={`num text-base font-bold ${owed ? 'text-pos' : 'text-neg'}`}
                      >
                        {formatMoney(group.balance, group.currency, true)}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-ink-4">
                        {owed ? 'you are owed' : 'you owe'}
                      </div>
                    </>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
