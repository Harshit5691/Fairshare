import { createFileRoute } from '@tanstack/react-router'
import { Avatar } from '../components/Avatar'
import { CURRENCIES } from '../constants/currencies'
import { users } from '../mock/data'
import { useAppStore } from '../store/app'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

const PREFS = [
  { key: 'push', label: 'Push notifications' },
  { key: 'email', label: 'Email summaries' },
  { key: 'simplify', label: 'Simplify group debts' },
] as const

function SettingsPage() {
  const homeCurrency = useAppStore((s) => s.homeCurrency)
  const setHomeCurrency = useAppStore((s) => s.setHomeCurrency)
  const prefs = useAppStore((s) => s.prefs)
  const togglePref = useAppStore((s) => s.togglePref)
  const pushToast = useAppStore((s) => s.pushToast)

  const me = users.me

  return (
    <div className="animate-slideup mx-auto max-w-[640px]">
      <h1 className="font-display mb-6 text-2xl font-bold tracking-tight text-ink">
        Settings
      </h1>

      {/* Profile */}
      <div className="mb-4 flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-surface p-5">
        <Avatar user={me} size={58} />
        <div className="flex-1">
          <div className="font-display text-lg font-bold text-ink">{me.name}</div>
          <div className="text-[13px] font-medium text-ink-3">maya@tally.co</div>
        </div>
        <button
          type="button"
          onClick={() => pushToast('Profile editing is not wired up yet')}
          className="cursor-pointer rounded-[9px] border border-white/10 px-4 py-2 text-[13px] font-semibold text-ink-2 transition hover:border-white/25 hover:text-ink"
        >
          Edit
        </button>
      </div>

      {/* Currency */}
      <div className="mb-4 rounded-2xl border border-white/[0.07] bg-surface p-5">
        <div className="mb-3 text-[13px] font-semibold text-ink-2">
          Default currency
        </div>
        <div className="flex flex-wrap gap-2">
          {CURRENCIES.map((currency) => {
            const active = currency.code === homeCurrency
            return (
              <button
                key={currency.code}
                type="button"
                onClick={() => setHomeCurrency(currency.code)}
                className={`cursor-pointer rounded-[10px] border px-4 py-2 text-[13px] font-semibold transition ${
                  active
                    ? 'border-accent/40 bg-accent/15 text-accent-soft'
                    : 'border-white/10 bg-surface-2 text-ink-2 hover:border-white/20'
                }`}
              >
                {currency.symbol} {currency.code}
              </button>
            )
          })}
        </div>
        <p className="mt-3 text-xs font-medium text-ink-4">
          Balances across currencies are converted to this for your totals.
        </p>
      </div>

      {/* Preferences */}
      <div className="mb-4 overflow-hidden rounded-2xl border border-white/[0.07] bg-surface">
        {PREFS.map((pref) => {
          const on = prefs[pref.key]
          return (
            <button
              key={pref.key}
              type="button"
              onClick={() => togglePref(pref.key)}
              className="flex w-full cursor-pointer items-center justify-between border-b border-white/5 px-5 py-4 text-left transition last:border-0 hover:bg-white/[0.02]"
            >
              <span className="text-sm font-medium text-ink">{pref.label}</span>
              <span
                className={`relative h-6 w-11 rounded-full transition ${
                  on ? 'bg-accent' : 'bg-white/12'
                }`}
              >
                <span
                  className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all"
                  style={{ left: on ? 22 : 2 }}
                />
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => pushToast('Sign out is not wired up yet')}
        className="w-full cursor-pointer rounded-xl border border-neg/30 py-3.5 text-[13px] font-semibold text-neg transition hover:bg-neg/10"
      >
        Sign out
      </button>
    </div>
  )
}
