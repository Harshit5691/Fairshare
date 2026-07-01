import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchGroups } from '../api/group'
import { Skeleton } from '../components/Skeleton'

export const Route = createFileRoute('/groups')({
  component: GroupsPage,
})

function GroupsPage() {
  const { data: groups, isLoading, isError} = useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
  })

  if(isLoading){
    return (
      <div className="p-6">
        <h1 className="font-display text-2xl font-bold text-ink mb-6">Groups</h1>
        <div className="grid grid-cols-2 gap-3.5">
          {Array.from({length: 4}).map((_,i) => (
            <div
              key={i}
              className='flex items-center gap-4 rounded-2xl border border-white/10 bg-surface p-5'
            >
              <Skeleton className="h-12 w-12 rounded-xl"/>
              <div className="flex-1">
                <Skeleton className='h-4 w-2/3'/>
                <Skeleton className='mt-2 h-3 w-1/3'/>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  if(isError) return <p className="text-neg">Failed to load groups</p>

  return (
    <div className="animate-slideup">
      <div className="p-6">
      <h1 className="font-display text-2xl font-bold text-ink mb-6">Groups</h1>

      <div className="grid grid-cols-2 gap-3.5">
        {groups?.map((group) => (
          <div
            key={group.id}
            className='flex items-center gap-4 rounded-2xl border border-white/10 bg-surface p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07] cursor-pointer'
          >
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-white/5 text-2xl">
              {group.emoji}
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold text-ink">
                {group.name}
              </div>
              <div className="mt-1 text-xs font-medium text-ink-4">
                {group.memberIds.length} members - {group.currency}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  )
}
