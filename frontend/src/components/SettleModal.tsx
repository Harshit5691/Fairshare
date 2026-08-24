import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSettlement, fetchSettleTargets } from '../api/group'
import { formatMoney } from '../lib/currency'
import { useAppStore } from '../store/app'
import { Avatar } from './Avatar'
import { Modal } from './Modal'
import { Skeleton } from './Skeleton'

export function SettleModal() {
  const open = useAppStore((s) => s.settleOpen)
  const groupId = useAppStore((s) => s.settleGroupId)
  const close = useAppStore((s) => s.closeSettle)
  const homeCurrency = useAppStore((s) => s.homeCurrency)
  const pushToast = useAppStore((s) => s.pushToast)
  const queryClient = useQueryClient()

  const { data: targets, isLoading } = useQuery({
    queryKey: ['settle-targets', groupId, homeCurrency],
    queryFn: () => fetchSettleTargets(homeCurrency, groupId ?? undefined),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: createSettlement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['group'] })
      queryClient.invalidateQueries({ queryKey: ['home'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
      queryClient.invalidateQueries({ queryKey: ['activity'] })
      queryClient.invalidateQueries({ queryKey: ['settle-targets'] })
      pushToast('Marked as paid — balances updated')
    },
    onError: () => pushToast('Could not record that payment', 'error'),
  })

  const debts = targets?.filter((t) => t.amount < 0) ?? []
  const credits = targets?.filter((t) => t.amount > 0) ?? []

  return (
    <Modal open={open} onClose={close} title="Settle up" maxWidth="max-w-[460px]">
      {isLoading ? (
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      ) : targets && targets.length > 0 ? (
        <>
          <p className="mb-4 text-[13px] font-medium text-ink-3">
            Here's the simplest way to clear your balances.
          </p>

          <div className="flex flex-col gap-2.5">
            {debts.map((target) => (
              <div
                key={target.user.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface p-4"
              >
                <Avatar user={target.user} size={38} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">
                    Pay {target.user.name}
                  </div>
                  <div className="num mt-0.5 text-xs font-medium text-neg">
                    You owe {formatMoney(Math.abs(target.amount), target.currency)}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      groupId: groupId ?? null,
                      toUser: target.user.id,
                      amount: Math.abs(target.amount),
                      currency: target.currency,
                      method: 'cash',
                    })
                  }
                  className="cursor-pointer rounded-[9px] bg-accent px-4 py-2 text-xs font-semibold text-bg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Mark paid
                </button>
              </div>
            ))}

            {credits.map((target) => (
              <div
                key={target.user.id}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface p-4"
              >
                <Avatar user={target.user} size={38} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-ink">
                    {target.user.name} owes you
                  </div>
                  <div className="num mt-0.5 text-xs font-medium text-pos">
                    {formatMoney(target.amount, target.currency)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => pushToast(`Reminder sent to ${target.user.name}`)}
                  className="cursor-pointer rounded-[9px] border border-white/10 px-4 py-2 text-xs font-semibold text-ink-2 transition hover:border-white/25 hover:text-ink"
                >
                  Remind
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-8 text-center text-sm font-medium text-ink-3">
          🎉 You're all settled up!
        </div>
      )}
    </Modal>
  )
}
