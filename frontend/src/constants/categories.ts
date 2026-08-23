import type { Category } from "../types";

export interface CategoryMeta{
    key: Category
    emoji: string
    bgTint: string
}

export const CATEGORIES: CategoryMeta[] = [
    { key: 'Food',          emoji: '🍽️', bgTint: 'rgba(255,90,95,.14)' },
    { key: 'Travel',        emoji: '✈️', bgTint: 'rgba(58,158,192,.14)' },
    { key: 'Rent',          emoji: '🏠', bgTint: 'rgba(122,90,217,.14)' },
    { key: 'Utilities',     emoji: '⚡', bgTint: 'rgba(217,140,58,.14)' },
    { key: 'Entertainment', emoji: '🎫', bgTint: 'rgba(61,220,151,.14)' },
    { key: 'Groceries',     emoji: '🛒', bgTint: 'rgba(61,220,151,.14)' },
    { key: 'Other',         emoji: '💳', bgTint: 'rgba(255,255,255,.08)' },
]

export const CATEGORY_BY_KEY: Record<Category, CategoryMeta> = Object.fromEntries(
    CATEGORIES.map((c) => [c.key, c]),
) as Record<Category,CategoryMeta>