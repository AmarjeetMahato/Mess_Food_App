// src/modules/menu/interfaces/IDailyMenuRepository.ts

import { DailyMenuRow, MenuItemRow } from "@/config/models";
import { MealSlot, CreateDailyMenuDto, UpdateDailyMenuDto } from "../dtos/DailyMenuDtos";

export interface IDailyMenuRepository {

  // ── Find ───────────────────────────────────────────────────────────
  findById(id: string): Promise<DailyMenuRow | null>;

  findByDateAndSlot(date: Date, slot: MealSlot): Promise<DailyMenuRow | null>;
  // duplicate check — same date + slot cannot exist twice

  findByDateRange(startDate: Date, endDate: Date): Promise<DailyMenuRow[]>;
  // used for 3-day view — fetches all active slots across 3 dates

  // ── Items (via menu_item_mappings) ─────────────────────────────────
  findItemsByMenuId(dailyMenuId: string): Promise<MenuItemRow[]>;
  // joins menu_item_mappings → menu_items

  replaceItems(dailyMenuId: string, itemIds: string[]): Promise<void>;
  // delete existing mappings then insert new ones atomically

  // ── Create ─────────────────────────────────────────────────────────
  create(dto: CreateDailyMenuDto, adminId: string): Promise<DailyMenuRow>;

  // ── Update ─────────────────────────────────────────────────────────
  update(id: string, dto: UpdateDailyMenuDto, adminId: string): Promise<DailyMenuRow | null>;

  // ── Activate / Deactivate ──────────────────────────────────────────
  deactivate(id: string, userId:string): Promise<number>;
  // admin deactivates a slot — e.g. no dinner on Sunday

  activate(id: string, userId: string): Promise<number>;
  // admin re-activates a slot — e.g. dinner on Sunday is back

  delete(id: string): Promise<number>;
}