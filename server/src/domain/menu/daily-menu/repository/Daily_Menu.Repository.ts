// src/modules/menu/menu.repository.ts

import type { DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import { eq, ilike, and, sql, gte, lte } from "drizzle-orm";
import { injectable, inject } from "tsyringe";

import {  IDailyMenuRepository } from "./IDailyMenu.Reppository";
import { InternalServerError } from "@/globalError/AppError";
import { DailyMenu, DailyMenuRow, MenuItem, MenuItemMapping, MenuItemRow } from "@/config/models";
import { MealSlot, CreateDailyMenuDto, UpdateDailyMenuDto } from "../dtos/DailyMenuDtos";

 
@injectable()
export class DailyMenuRepository implements IDailyMenuRepository {
 
  constructor(
    @inject(TOKENS.DB) private readonly db: DbOrTx,
  ) {}

  async findById(id: string): Promise<DailyMenuRow | null> {
    const [row] = await this.db
      .select()
      .from(DailyMenu)
      .where(eq(DailyMenu.id, id))
      .limit(1);
    return row ?? null;
  }
 
  async findByDateAndSlot(date: Date, slot: MealSlot): Promise<DailyMenuRow | null> {
    const [row] = await this.db
      .select()
      .from(DailyMenu)
      .where(
        and(
          eq(DailyMenu.menu_date, date),
          eq(DailyMenu.slot,      slot),
          eq(DailyMenu.is_active, true),
        ),
      )
      .limit(1);
    return row ?? null;
  }
 
  async findByDateRange(startDate: Date, endDate: Date): Promise<DailyMenuRow[]> {
    return this.db
      .select()
      .from(DailyMenu)
      .where(
        and(
          gte(DailyMenu.menu_date, startDate),
          lte(DailyMenu.menu_date, endDate),
          eq(DailyMenu.is_active,  true),
        ),
      );
  }
 
  async findItemsByMenuId(dailyMenuId: string): Promise<MenuItemRow[]> {
    const results = await this.db
      .select({ item: MenuItem })
      .from(MenuItemMapping)
      .innerJoin(MenuItem, eq(MenuItemMapping.menu_item_id, MenuItem.id))
      .where(eq(MenuItemMapping.daily_menu_id, dailyMenuId));
    return results.map((r) => r.item);
  }
 
  async replaceItems(dailyMenuId: string, itemIds: string[]): Promise<void> {
    await this.db
      .delete(MenuItemMapping)
      .where(eq(MenuItemMapping.daily_menu_id, dailyMenuId));
 
    if (itemIds.length > 0) {
      await this.db
        .insert(MenuItemMapping)
        .values(itemIds.map((id) => ({
          daily_menu_id: dailyMenuId,
          menu_item_id:  id,
        })));
    }
  }
 
  async create(dto: CreateDailyMenuDto, adminId: string): Promise<DailyMenuRow> {
    const [row] = await this.db
      .insert(DailyMenu)
      .values({
        menu_date:  dto.menu_date,
        slot:       dto.slot,
        is_active:  true,
        created_by: adminId,
      })
      .returning();
    
      if(!row){
         throw new InternalServerError("Failed to create Daily Menu");
      }

    return row;
  }
 
  async update(id: string, dto: UpdateDailyMenuDto, adminId: string): Promise<DailyMenuRow | null> {
    const updateData: Partial<typeof DailyMenu.$inferInsert> = {
      updated_at: new Date(),
      created_by: adminId
    };
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
 
    const [row] = await this.db
      .update(DailyMenu)
      .set(updateData)
      .where(eq(DailyMenu.id, id))
      .returning();
    return row ?? null;
  }
 
  async deactivate(id: string, userId:string): Promise<number> {
    const result = await this.db
      .update(DailyMenu)
      .set({ is_active: false, updated_at: new Date(),created_by:userId })
      .where(eq(DailyMenu.id, id))
      .returning({id: DailyMenu.id});


     return result.length; // number of rows affected
  }

  async activate(id: string, userId: string): Promise<number> {
       const result = await this.db
      .update(DailyMenu)
      .set({ is_active: true, updated_at: new Date(),created_by:userId})
      .where(eq(DailyMenu.id, id))
      .returning({id: DailyMenu.id});


     return result.length; // number of rows affected
  }

  async  delete(id: string): Promise<number> {
      const result = await this.db.delete(DailyMenu)
      .where(eq(DailyMenu.id, id))
      .returning({id: DailyMenu.id});
      return result.length; // number of rows affected
  };
}
 