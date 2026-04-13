import { extractEmbeddedElements } from "../helpers.js";
import {
  DaySchema,
  WeekDaySchema,
  NonWorkingDaySchema,
  type Day,
  type WeekDay,
  type NonWorkingDay,
} from "../schemas/index.js";
import type { OpenProjectClient } from "./index.js";

export function registerDayMethods(Client: typeof OpenProjectClient): void {
  Client.prototype.listDays = async function(
    this: OpenProjectClient,
    from: string,
    to: string,
  ): Promise<Day[]> {
    const data = await this.request("GET", "/days", {
      params: { filters: JSON.stringify([{ date: { operator: "<>d", values: [from, to] } }]) },
    });
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(DaySchema, e, "listDays[]"));
  };

  Client.prototype.listWeekDays = async function(this: OpenProjectClient): Promise<WeekDay[]> {
    const data = await this.request("GET", "/days/week");
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(WeekDaySchema, e, "listWeekDays[]"));
  };

  Client.prototype.listNonWorkingDays = async function(this: OpenProjectClient): Promise<NonWorkingDay[]> {
    const data = await this.request("GET", "/days/non_working");
    const elements = extractEmbeddedElements(data);
    return elements.map(e => this.parseResponse(NonWorkingDaySchema, e, "listNonWorkingDays[]"));
  };
}
