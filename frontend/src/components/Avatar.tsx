import type { User } from '../types'

type AvatarProps = {
  user: User
  size?: number
  className?: string
}

export function Avatar({ user, size = 36, className = '' }: AvatarProps) {
  return (
    <div
      className={`flex flex-none items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        backgroundColor: user.avatarColor,
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
      }}
    >
      {user.initials}
    </div>
  )
}

export function AvatarStack({ users, max = 3 }: { users: User[]; max?: number }) {
  const shown = users.slice(0, max)
  const extra = users.length - shown.length

  return (
    <div className="flex items-center">
      {shown.map((user, i) => (
        <div
          key={user.id}
          className="rounded-full border-2 border-surface"
          style={{ marginLeft: i === 0 ? 0 : -8 }}
        >
          <Avatar user={user} size={24} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-white/10 text-[9px] font-semibold text-ink-2"
          style={{ marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
