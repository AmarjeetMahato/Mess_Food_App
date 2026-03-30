import { inject, injectable } from "tsyringe";
import { IMenuItemRepository } from "./IMenu_Item.Repository";
import type { DbOrTx } from "@/config/database/database";
import { MenuItemRow, MenuItem } from "@/config/models";
import { TOKENS } from "@/helper/user_and_auth/token";
import { eq, ilike, and, sql } from "drizzle-orm";
import { CreateMenuItemDto, ListMenuItemsDto, UpdateMenuItemDto } from "../dtos/MenuItemDtos";
import { InternalServerError } from "@/globalError/AppError";

@injectable()
export class MenuItemRepository implements IMenuItemRepository {
      constructor(
    @inject(TOKENS.DB) private readonly db: DbOrTx,
  ) {}
 
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
  async create(dto: CreateMenuItemDto): Promise<MenuItemRow> {
    const [row] = await this.db
      .insert(MenuItem)
      .values({
        name:         dto.name,
        description:  dto.description  ?? null,
        category:     dto.category,
        image_url:    dto.image_url    ?? null,
        is_available: dto.is_available ?? true,
      })
      .returning();

      if(!row){
         throw new InternalServerError("Failed to create MenuItems");     
      }

    return row;
  }
 
  // ── Update ─────────────────────────────────────────────────────────
  // Only updates fields that are explicitly provided — no accidental overwrites
  async update(
    id:  string,
    dto: UpdateMenuItemDto,
  ): Promise<MenuItemRow | null> {
    const updateData: Partial<typeof MenuItem.$inferInsert> = {
      updated_at: new Date(),
    };
 
    if (dto.name         !== undefined) updateData.name         = dto.name;
    if (dto.description  !== undefined) updateData.description  = dto.description;
    if (dto.category     !== undefined) updateData.category     = dto.category;
    if (dto.image_url    !== undefined) updateData.image_url    = dto.image_url;
    if (dto.is_available !== undefined) updateData.is_available = dto.is_available;
 
    const [row] = await this.db
      .update(MenuItem)
      .set(updateData)
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