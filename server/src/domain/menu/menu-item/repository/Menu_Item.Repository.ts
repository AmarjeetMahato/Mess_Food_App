import { inject, injectable } from "tsyringe";
import { IMenuItemRepository } from "./IMenu_Item.Repository";
import type { DbOrTx } from "@/config/database/database";
import { MenuItemRow, MenuItem } from "@/config/models";
import { TOKENS } from "@/helper/user_and_auth/token";
import { eq, ilike, and, sql } from "drizzle-orm";
import {  ListMenuItemsDto } from "../dtos/MenuItemDtos";
import { InternalServerError } from "@/globalError/AppError";
import { MenuItemEntity } from "../entity/Menu.Entity";
import { MenuItemMapper } from "../mapper/Menu_Item.Mapper";

@injectable()
export class MenuItemRepository implements IMenuItemRepository {
      
  constructor(@inject(TOKENS.DB) private readonly db: DbOrTx,) {}
 
  // ── Find by ID ─────────────────────────────────────────────────────
  async findById(id: string): Promise<MenuItemRow | null> {
    const [row] = await this.db
      .select()
      .from(MenuItem)
      .where(eq(MenuItem.id, id))
      .limit(1);
 
    return row ?? null;
  }
 
  // ── Find all (filtered + counted) ─────────────────────────────────
  async findAll(
    dto: ListMenuItemsDto,
  ): Promise<{ rows: MenuItemRow[]; total: number }> {
    const conditions = [];
 
    if (dto.category !== undefined) {
      conditions.push(eq(MenuItem.category, dto.category));
    }
 
    if (dto.is_available !== undefined) {
      conditions.push(eq(MenuItem.is_available, dto.is_available));
    }
 
    if (dto.search) {
      // Case-insensitive search on name
      conditions.push(ilike(MenuItem.name, `%${dto.search}%`));
    }
 
    const where = conditions.length > 0
      ? and(...conditions)
      : undefined;
 
    // Fetch rows
    const rows = await this.db
      .select()
      .from(MenuItem)
      .where(where);
 
    // Fetch total count — same filter, no pagination limit
    const [countResult] = await this.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(MenuItem)
      .where(where);
 
    return {
      rows,
      total: countResult?.count ?? 0,
    };
  }
 
  // ── Create ─────────────────────────────────────────────────────────
  async create(entity: MenuItemEntity): Promise<MenuItemRow> {
      const payload = MenuItemMapper.toPersistence(entity)
    const [row] = await this.db
      .insert(MenuItem)
      .values(payload)
      .returning();

      if(!row){
         throw new InternalServerError("Failed to create MenuItems");     
      }

    return row;
  }
 
  // ── Update ─────────────────────────────────────────────────────────
  // Only updates fields that are explicitly provided — no accidental overwrites
  async update(id:  string,entity: MenuItemEntity,): Promise<MenuItemRow | null> {
         
    const payload = MenuItemMapper.toPersistence(entity)

 
    const [row] = await this.db
      .update(MenuItem)
      .set({
           ...payload,
           updated_at: new Date()
      })
      .where(eq(MenuItem.id, id))
      .returning();
 
    return row ?? null;
  }
 
  // ── Soft delete ────────────────────────────────────────────────────
  // Sets is_available = false — item still exists in DB
  // Keeps historical menu entries intact — menu_item_mappings still valid
  async delete(id: string): Promise<void> {
    await this.db
      .update(MenuItem)
      .set({
        is_available: false,
        updated_at:   new Date(),
      })
      .where(eq(MenuItem.id, id));
  }
}