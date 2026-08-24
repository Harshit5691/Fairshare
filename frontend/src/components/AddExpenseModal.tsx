import { useMemo, useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { createExpense, fetchGroups, ME, type GroupSummary } from '../api/group'
import { CATEGORIES } from '../constants/categories'
import { formatMoney } from '../lib/currency'
import { validateSplits } from '../lib/splits'
import { users } from '../mock/data'
import { useAppStore } from '../store/app'
import type { Category, SplitType } from '../types'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { Modal } from './Modal'

/** Validates the non-split fields. Split maths is checked separately. */
const expenseSchema = z.object({
  description: z.string().trim().min(1, 'Add a description'),
  amount: z
    .number({ error: 'Enter an amount' })
    .positive('Amount must be greater than zero'),
  groupId: z.string().min(1, 'Pick a group'),
  paidBy: z.string().min(1, 'Pick who paid'),
})

const SPLIT_MODES: { value: SplitType; label: string }[] = [
  { value: 'equal', label: 'Equally' },
  { value: 'exact', label: 'Exact amounts' },
  { value: 'percentage', label: 'Percentages' },
]

export function AddExpenseModal() {
  const open = useAppStore((s) => s.addExpenseOpen)
  const presetGroupId = useAppStore((s) => s.addExpenseGroupId)
  const session = useAppStore((s) => s.addExpenseSession)
  const close = useAppStore((s) => s.closeAddExpense)

  const { data: groups } = useQuery({ queryKey: ['groups'], queryFn: fetchGroups })

  if (!open) return null

  return (
    <Modal open={open} onClose={close} title="Add an expense">
      {groups && groups.length > 0 ? (
        // The session key remounts the form on every open, so it always starts
        // from clean defaults — no seeding effect, no cascading renders.
        <ExpenseForm
          key={session}
          groups={groups}
          presetGroupId={presetGroupId}
          onDone={close}
        />
      ) : (
        <div className="py-6 text-center text-sm text-ink-3">Loading groups…</div>
      )}
    </Modal>
  )
}

function ExpenseForm({
  groups,
  presetGroupId,
  onDone,
}: {
  groups: GroupSummary[]
  presetGroupId: string | null
  onDone: () => void
}) {
  const pushToast = useAppStore((s) => s.pushToast)
  const queryClient = useQueryClient()

  const initialGroup = groups.find((g) => g.id === presetGroupId) ?? groups[0]

  const [groupId, setGroupId] = useState(initialGroup.id)
  const [description, setDescription] = useState('')
  const [amountText, setAmountText] = useState('')
  const [category, setCategory] = useState<Category>('Food')
  const [paidBy, setPaidBy] = useState(ME)
  const [splitType, setSplitType] = useState<SplitType>('equal')
  const [participantIds, setParticipantIds] = useState<string[]>(initialGroup.memberIds)
  const [inputValues, setInputValues] = useState<Record<string, number>>({})
  const [submitted, setSubmitted] = useState(false)

  const group = useMemo(() => groups.find((g) => g.id === groupId), [groups, groupId])
  const amount = Number.parseFloat(amountText) || 0

  function selectGroup(nextId: string) {
    const next = groups.find((g) => g.id === nextId)
    if (!next) return

    setGroupId(nextId)
    setParticipantIds(next.memberIds)
    setPaidBy(next.memberIds.includes(paidBy) ? paidBy : ME)
    setInputValues({})
  }

  function toggleParticipant(userId: string) {
    setParticipantIds((current) => {
      const next = current.includes(userId)
        ? current.filter((id) => id !== userId)
        : [...current, userId]
      // Never allow an empty split.
      return next.length === 0 ? current : next
    })
  }

  function setInputValue(userId: string, raw: string) {
    const parsed = Number.parseFloat(raw)
    setInputValues((current) => ({
      ...current,
      [userId]: Number.isNaN(parsed) ? 0 : parsed,
    }))
  }

  const fieldResult = expenseSchema.safeParse({ description, amount, groupId, paidBy })
  const fieldErrors = fieldResult.success
    ? {}
    : z.flattenError(fieldResult.error).fieldErrors

  const splitCheck = validateSplits(splitType, amount, participantIds, inputValues)
  const canSubmit = fieldResult.success && splitCheck.valid

  const mutation = useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      // Every screen that reads expenses is now stale.
      for (const key of [
        'groups',
        'group',
        'home',
        'friends',
        'activity',
        'insights',
        'settle-targets',
      ]) {
        queryClient.invalidateQueries({ queryKey: [key] })
      }
      pushToast('Expense added — balances updated')
      onDone()
    },
    onError: () => pushToast('Could not add the expense', 'error'),
  })

  function handleSubmit() {
    setSubmitted(true)
    if (!canSubmit) return

    mutation.mutate({
      groupId,
      description: description.trim(),
      category,
      amount,
      paidBy,
      splitType,
      participantIds,
      inputValues,
    })
  }

  const members = group?.memberIds.map((id) => users[id]) ?? []
  const currency = group?.currency ?? 'USD'
  const perPerson = participantIds.length > 0 ? amount / participantIds.length : 0

  function shareFor(userId: string): number {
    if (!participantIds.includes(userId)) return 0
    if (splitType === 'equal') return perPerson
    if (splitType === 'exact') return inputValues[userId] ?? 0
    return (amount * (inputValues[userId] ?? 0)) / 100
  }

  return (
    <div className="flex flex-col gap-5">
      <Field label="Group">
        <div className="flex flex-wrap gap-2">
          {groups.map((g) => {
            const active = g.id === groupId
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => selectGroup(g.id)}
                className={`flex cursor-pointer items-center gap-1.5 rounded-[10px] border px-3.5 py-2 text-sm font-semibold transition ${
                  active
                    ? 'border-accent/40 bg-accent/15 text-accent-soft'
                    : 'border-white/10 bg-surface text-ink-2 hover:border-white/20'
                }`}
              >
                <span>{g.emoji}</span>
                {g.name}
              </button>
            )
          })}
        </div>
      </Field>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-[1.6]">
          <Field
            label="Description"
            error={submitted ? fieldErrors.description?.[0] : undefined}
          >
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Dinner"
              className="w-full rounded-[11px] border border-white/10 bg-surface px-4 py-3 text-sm font-medium text-ink outline-none transition focus:border-white/25"
            />
          </Field>
        </div>
        <div className="flex-1">
          <Field
            label={`Amount (${currency})`}
            error={submitted ? fieldErrors.amount?.[0] : undefined}
          >
            <input
              value={amountText}
              onChange={(e) => setAmountText(e.target.value.replace(/[^0-9.]/g, ''))}
              inputMode="decimal"
              placeholder="0.00"
              className="num w-full rounded-[11px] border border-white/10 bg-surface px-4 py-3 text-[15px] font-semibold text-ink outline-none transition focus:border-white/25"
            />
          </Field>
        </div>
      </div>

      <Field label="Category">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = c.key === category
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? 'border-accent/40 bg-accent/15 text-accent-soft'
                    : 'border-white/10 bg-surface text-ink-2 hover:border-white/20'
                }`}
              >
                {c.emoji} {c.key}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Paid by">
        <div className="flex flex-wrap gap-2">
          {members.map((member) => {
            const active = member.id === paidBy
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setPaidBy(member.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'border-accent/40 bg-accent/15 text-accent-soft'
                    : 'border-white/10 bg-surface text-ink-2 hover:border-white/20'
                }`}
              >
                <Avatar user={member} size={20} />
                {member.id === ME ? 'You' : member.name.split(' ')[0]}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Split">
        <div className="inline-flex gap-1 rounded-[10px] border border-white/[0.07] bg-surface p-1">
          {SPLIT_MODES.map((mode) => {
            const active = mode.value === splitType
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => {
                  setSplitType(mode.value)
                  setInputValues({})
                }}
                className={`cursor-pointer rounded-[7px] px-3.5 py-1.5 text-xs font-semibold transition ${
                  active ? 'bg-accent text-bg' : 'text-ink-3 hover:text-ink'
                }`}
              >
                {mode.label}
              </button>
            )
          })}
        </div>
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-ink-2">
            {splitType === 'equal'
              ? 'Split equally between'
              : splitType === 'exact'
                ? 'Exact amount each'
                : 'Percentage each'}
          </div>
          <div
            className={`num text-xs font-semibold ${
              splitCheck.valid ? 'text-pos' : 'text-neg'
            }`}
          >
            {splitType === 'equal'
              ? `${formatMoney(perPerson, currency)} each`
              : splitCheck.valid
                ? 'adds up ✓'
                : splitCheck.message}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          {members.map((member) => {
            const included = participantIds.includes(member.id)
            return (
              <div
                key={member.id}
                className={`flex items-center gap-3 rounded-[10px] p-2.5 transition ${
                  included ? 'bg-white/[0.03]' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleParticipant(member.id)}
                  className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                >
                  <Avatar user={member} size={30} />
                  <span className="truncate text-[13px] font-semibold text-ink">
                    {member.id === ME ? 'You' : member.name}
                  </span>
                </button>

                {included && splitType !== 'equal' && (
                  <div className="flex flex-none items-center gap-1">
                    <input
                      value={inputValues[member.id] ?? ''}
                      onChange={(e) =>
                        setInputValue(member.id, e.target.value.replace(/[^0-9.]/g, ''))
                      }
                      inputMode="decimal"
                      placeholder="0"
                      className="num w-20 rounded-lg border border-white/10 bg-surface px-2.5 py-1.5 text-right text-xs font-semibold text-ink outline-none focus:border-white/25"
                    />
                    <span className="w-3 text-xs font-medium text-ink-4">
                      {splitType === 'percentage' ? '%' : ''}
                    </span>
                  </div>
                )}

                <div className="num w-20 flex-none text-right text-xs font-semibold text-ink-2">
                  {included ? formatMoney(shareFor(member.id), currency) : '—'}
                </div>

                <button
                  type="button"
                  onClick={() => toggleParticipant(member.id)}
                  aria-label={included ? 'Remove from split' : 'Add to split'}
                  className={`flex h-5 w-5 flex-none cursor-pointer items-center justify-center rounded-[7px] border text-[11px] transition ${
                    included
                      ? 'border-pos bg-pos text-bg'
                      : 'border-white/20 text-transparent'
                  }`}
                >
                  ✓
                </button>
              </div>
            )
          })}
        </div>
      </div>

      <Button
        type="button"
        onClick={handleSubmit}
        disabled={!canSubmit || mutation.isPending}
        className="w-full py-3.5"
      >
        {mutation.isPending
          ? 'Adding…'
          : canSubmit
            ? `Add ${formatMoney(amount, currency)} expense`
            : 'Enter amount & description'}
      </Button>
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-semibold text-ink-2">{label}</div>
      {children}
      {error && <div className="mt-1.5 text-xs font-medium text-neg">{error}</div>}
    </div>
  )
}
