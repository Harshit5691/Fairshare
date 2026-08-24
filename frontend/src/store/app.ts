import { create } from 'zustand'
import type { CurrencyCode } from '../types'

export interface Toast {
  id: number
  message: string
  tone: 'success' | 'error'
}

interface AppState {
  /** Currency all cross-group totals are converted to. */
  homeCurrency: CurrencyCode
  setHomeCurrency: (currency: CurrencyCode) => void

  /** Notification preferences from the Settings screen. */
  prefs: { push: boolean; email: boolean; simplify: boolean }
  togglePref: (key: 'push' | 'email' | 'simplify') => void

  /** Add-expense modal. `groupId` preselects a group when opened from one. */
  addExpenseOpen: boolean
  addExpenseGroupId: string | null
  /** Increments on every open, so the form remounts fresh each time. */
  addExpenseSession: number
  openAddExpense: (groupId?: string) => void
  closeAddExpense: () => void

  /** Settle-up modal, optionally scoped to one group. */
  settleOpen: boolean
  settleGroupId: string | null
  openSettle: (groupId?: string) => void
  closeSettle: () => void

  toasts: Toast[]
  pushToast: (message: string, tone?: 'success' | 'error') => void
  dismissToast: (id: number) => void
}

export const useAppStore = create<AppState>((set) => ({
  homeCurrency: 'USD',
  setHomeCurrency: (homeCurrency) => set({ homeCurrency }),

  prefs: { push: true, email: false, simplify: true },
  togglePref: (key) =>
    set((state) => ({ prefs: { ...state.prefs, [key]: !state.prefs[key] } })),

  addExpenseOpen: false,
  addExpenseGroupId: null,
  addExpenseSession: 0,
  openAddExpense: (groupId) =>
    set((state) => ({
      addExpenseOpen: true,
      addExpenseGroupId: groupId ?? null,
      addExpenseSession: state.addExpenseSession + 1,
    })),
  closeAddExpense: () => set({ addExpenseOpen: false, addExpenseGroupId: null }),

  settleOpen: false,
  settleGroupId: null,
  openSettle: (groupId) => set({ settleOpen: true, settleGroupId: groupId ?? null }),
  closeSettle: () => set({ settleOpen: false, settleGroupId: null }),

  toasts: [],
  pushToast: (message, tone = 'success') =>
    set((state) => ({
      toasts: [...state.toasts, { id: Date.now() + Math.random(), message, tone }],
    })),
  dismissToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
