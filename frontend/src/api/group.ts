import { groups, expenses, users } from "../mock/data";
import type { Group, Expense, User } from "../types";
import { computeNetBalance } from "../lib/balances";

const ME = 'me'

export interface GroupSummary extends Group{
    balance: number
}

export interface GroupDetail{
    group: Group
    members: User[]
    expenses: Expense[]
}

export async function fetchGroups(): Promise<GroupSummary[]>{
    await new Promise((resolve) => setTimeout(resolve,400))

    return groups.map((group) => {
        const groupExpenses = expenses.filter((e) => e.groupId === group.id)
        return {
            ...group,
            balance: computeNetBalance(groupExpenses, ME),
        }
    })
}

export async function fetchGroupDetail(groupId: string): Promise<GroupDetail> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const group = groups.find((g) => g.id === groupId)
    if(!group) throw new Error(`Group ${groupId} not found`)
    
    const members = group.memberIds.map((id) => users[id])
    const groupExpenses = expenses.filter((e) => e.groupId === groupId)

    return { group,members,expenses: groupExpenses}
}