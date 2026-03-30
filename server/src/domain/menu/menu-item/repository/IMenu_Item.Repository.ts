import { MenuItemRow } from "@/config/models";
import { CreateMenuItemDto, ListMenuItemsDto, UpdateMenuItemDto } from "../dtos/MenuItemDtos";



export interface IMenuItemRepository {
 
  // ── Find ───────────────────────────────────────────────────────────
  findById(id: string): Promise<MenuItemRow | null>;
 
  findAll(dto: ListMenuItemsDto): Promise<{
    rows:  MenuItemRow[];
    total: number;
  }>;
  // total returned in same call — no separate COUNT query
 
  // ── Create ─────────────────────────────────────────────────────────
  create(dto: CreateMenuItemDto): Promise<MenuItemRow>;
 
  // ── Update ─────────────────────────────────────────────────────────
  update(id: string, dto: UpdateMenuItemDto): Promise<MenuItemRow | null>;
  // returns null if item not found
 
  // ── Delete ─────────────────────────────────────────────────────────
  delete(id: string): Promise<void>;
  // soft delete — sets is_available = false, updated_at = now()
  // never hard delete — keep for historical menu audit
}
 