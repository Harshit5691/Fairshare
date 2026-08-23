import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { fetchGroupDetail } from "../api/group";
import { computeNetBalance,computePairBalance } from "../lib/balances";
import { formatMoney } from "../lib/currency";
import { EmptyState } from "../components/EmptyState";
import { Skeleton } from "../components/Skeleton";
import { CATEGORY_BY_KEY } from "../constants/categories";

const ME = 'me'

export const Route = createFileRoute('/groups/$groupId')({
    component: GroupDetailPage,
})

function GroupDetailPage(){
    const { groupId } = Route.useParams()

    const { data, isLoading, isError } = useQuery({
        queryKey: ['group', groupId],
        queryFn: () => fetchGroupDetail(groupId),
    })

    if(isLoading){
        return (
            <div className="animate-slideup max-w-210 mx-auto">
                <Skeleton className="h-6 w-32 mb-6"/>
                <Skeleton className="h-16 w-full mb-4"/>
                <Skeleton className="h-64 w-full"/>
            </div>
        )
    }

    if(isError || !data){
        return (
            <EmptyState
                emoji="⚠️"
                title="Couldn't load this group"
                message="We couldn't find or load this group.It may have been deleted."
                action={
                    <Link to="/groups" className="rounded=[10px] bg-accent px-5 py-2.5 text-sm font-bold text-bg cursor-pointer transition hover:brightness-110">
                        Back to groups
                    </Link>
                }
            />
        )
    }

    const { group, members, expenses } = data

    const net = computeNetBalance(expenses, ME)
    const isPositive = net >= 0
    const totalSpent = expenses.reduce((sum,e) => sum + e.amount,0)

    const memberBalances = members.filter((m) => m.id !== ME).map((m) => ({
        member: m,
        balance: computePairBalance(expenses,ME,m.id),
    }))

    return (
        <div className="classname animate-slideup max-w-210 mx-auto">
            <Link to="/groups" className="text-sm font-semibold text-ink-3 hover:text-ink">
                ← All groups
            </Link>

            {/* header */}
            <div className="flex items-center gap-4 mt-4 mb-6">
                <div className="flex h-16 w-16 flex-none items-center justify-center rounded-2xl bg-white/5 text-3xl">
                    {group.emoji}
                </div>
                <div>
                    <h1 className="font-display text-2xl font-bold text-ink">{group.name}</h1>
                    <div className="mt-1 text-sm font-medium text-ink-3">
                        {members.length} members - {group.currency}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-5">
                {/* {Left Coloumn} */}
                <div>
                    {/* net-balance summary */}
                    <div className={`rounded-2xl border p-5 mb-6 ${isPositive ? 'border-pos/20 bg-pos/8' : 'border-neg/20 bg-neg/8'}`}>
                        <div className="text-xs font-medium text-ink-2">
                            {isPositive ? 'You are owed overall' : 'You owe overall'}
                        </div>
                        <div className={`font-display text-3xl font-bold mt-1 ${isPositive? 'text-pos' : 'text-neg'}`}>
                            {formatMoney(net,group.currency,true)}
                        </div>
                        <div className="mt-1 text-xs font-medium text-ink-4">
                            Total spent {formatMoney(totalSpent,group.currency)}
                        </div>
                    </div>

                    {/* per-member balance */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3">
                        Balances
                    </div>
                    <div className="flex flex-col">
                        {memberBalances.map(({member, balance}) => {
                            const settled = Math.abs(balance) < 0.005
                            const theyOweYou = balance > 0
                            return (
                                <div key={member.id} className="flex items-center gap-3 py-3 border-b border-white/5">
                                    <div
                                        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-white"
                                        style={{ backgroundColor: member.avatarColor}}
                                    >
                                        {member.initials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-semibold text-ink">{member.name}</div>
                                        <div className={`text-xs font-medium ${settled ? 'text-ink-4' : theyOweYou ? 'text-pos': 'text-neg'}`}>
                                            {settled ? 'settled up' : theyOweYou ? 'owes you': 'you owe'}
                                        </div>
                                    </div>
                                    <div className={`font-display text-sm font-semibold ${settled ? 'text-ink-3' : theyOweYou ? 'text-pos' : 'text-neg'}`}>
                                        {formatMoney(balance,group.currency,true)}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* {Right Coloumn} */}
                <div>
                    {/* expense-list */}
                    <div className="text-xs font-semibold uppercase tracking-wide text-ink-3 mb-3">
                        Expenses
                    </div>
                    <div className="rounded-2xl border border-white/5 bg-surface-2 overflow-hidden">
                        {expenses.map((e) => {
                            const payer = e.paidBy === ME ? 'You' : members.find((m) => m.id === e.paidBy)?.name ?? '?'
                            const cat = CATEGORY_BY_KEY[e.category]
                            return (
                                <div key={e.id} className="flex items-center gap-3 px-4 py-3.5 border-b border-white/5">
                                    <div
                                        className="flex h-9 w-9 flex-none items-center justify-center rounded-[10px] text-base"
                                        style={{backgroundColor: cat.bgTint}}
                                    >
                                        {cat.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-ink">{e.description}</div>
                                        <div className="mt-0.5 text-xs font-medium text-ink-4">
                                            {payer} paid {formatMoney(e.amount,e.currency)}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
