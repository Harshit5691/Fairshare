import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchFriends } from '../api/group'
import { Avatar } from '../components/Avatar'
import { EmptyState } from '../components/EmptyState'
import { Skeleton } from '../components/Skeleton'
import { SETTLED_EPSILON } from '../lib/balances'
import { formatMoney } from '../lib/currency'
import { useAppStore } from '../store/app'

export const Route = createFileRoute('/friends')({
  component: FriendsPage,
})

function FriendsPage() {
  const homeCurrency = useAppStore((s) => s.homeCurrency)
  const openSettle = useAppStore((s) => s.openSettle)
  const pushToast = useAppStore((s) => s.pushToast)

  const { data: friends, isLoading, isError, refetch } = useQuery({
    queryKey: ['friends', homeCurrency],
    queryFn: () => fetchFriends(homeCurrency),
  })

  return (
    <div className="animate-slideup mx-auto max-w-[760px]">
      <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
        Friends
      </h1>
      <p className="mb-6 mt-1.5 text-[13px] font-medium text-ink-3">
        Your running balance with each person, netted across all groups.
      </p>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[74px] rounded-2xl" />
          ))}
        </div>
      ) : isError || !friends ? (
        <EmptyState
          emoji="⚠️"
          title="Couldn't load your friends"
          message="Something went wrong computing balances."
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
      ) : friends.length === 0 ? (
        <EmptyState
          emoji="👥"
          title="No shared balances yet"
          message="Once you split an expense with someone, they'll show up here."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-2">
          {friends.map((friend) => {
            const settled = Math.abs(friend.amount) < SETTLED_EPSILON
            const owesYou = friend.amount > 0

            return (
              <div
                key={friend.user.id}
                className="flex items-center gap-3.5 border-b border-white/5 px-4 py-4 last:border-0"
              >
                <Avatar user={friend.user} size={42} />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold text-ink">
                    {friend.user.name}
                  </div>
                  <div
                    className={`mt-0.5 text-xs font-medium ${
                      settled ? 'text-ink-4' : owesYou ? 'text-pos' : 'text-neg'
                    }`}
                  >
                    {settled ? 'settled up' : owesYou ? 'owes you' : 'you owe'}
                  </div>
                </div>
                <div
                  className={`num text-base font-bold ${
                    settled ? 'text-ink-3' : owesYou ? 'text-pos' : 'text-neg'
                  }`}
                >
                  {formatMoney(friend.amount, homeCurrency, true)}
                </div>
                {!settled && (
                  <button
                    type="button"
                    onClick={() =>
                      owesYou
                        ? pushToast(`Reminder sent to ${friend.user.name}`)
                        : openSettle()
                    }
                    className="cursor-pointer rounded-[9px] border border-white/10 px-3.5 py-2 text-xs font-semibold text-ink-2 transition hover:border-white/25 hover:text-ink"
                  >
                    {owesYou ? 'Remind' : 'Pay'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
