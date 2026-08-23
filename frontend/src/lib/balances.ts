import type { Expense } from "../types";

export function computeNetBalance(expenses: Expense[], meId: string): number{
    let net = 0
    for(const expense of expenses){
        const myShare = expense.splits.find((s) => s.userId === meId)?.shareAmount ?? 0
        if(expense.paidBy === meId){
            net += expense.amount - myShare
        } else {
            net -= myShare
        }
    }

    return net;
}

export function computePairBalance(
    expenses: Expense[],
    meId: string,
    otherId: string
): number{
    let balance = 0
    for(const expense of expenses){
        if(expense.paidBy === meId){
            const theirShare = expense.splits.find((s) => s.userId === otherId)?.shareAmount ?? 0
            balance += theirShare
        } else if(expense.paidBy === otherId){
            const myShare = expense.splits.find((s) => s.userId === meId)?.shareAmount ?? 0
            balance -= myShare
        }
    }

    return balance
}