import { groups } from "../mock/data";
import type { Group } from "../types";

export async function fetchGroups(): Promise<Group[]>{
    await new Promise((resolve) => setTimeout(resolve,400))
    return groups
}