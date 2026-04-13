import {
  BudgetSchema,
  type Budget,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerBudgetMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.getBudget = async function(this: OpenProjectClient, id: number): Promise<Budget> {
    const data = await this.request("GET", `/budgets/${id}`);
    return this.parseResponse(BudgetSchema, data, "getBudget");
  };
}
