import { inject, injectable } from "tsyringe";
import { IMenuItemMappingRepository } from "./IMenuItemMappingRepository";
import { MenuItemMapping, MenuItemMappingRow } from "@/config/models";
import { CreateMenuItemMappingDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";
import { TOKENS } from "@/helper/user_and_auth/token";
import type { DbOrTx } from "@/config/database/database";
import { InternalServerError } from "@/globalError/AppError";
import { and, eq ,desc, count} from "drizzle-orm";
import { MenuItemMappingEntity } from "../entity/menuItemMappingEntity";
import { MenuItemMappingMapper } from "../mapper/menuItemMappingMapper";

@injectable()
export class MenuItemMappingRepository implements IMenuItemMappingRepository {
   
    constructor(@inject(TOKENS.DB) private db:DbOrTx){}


    async findByMenuAndItem(daily_menuId: string, menuItemId: string): Promise<MenuItemMappingRow | null> {
        return await this.db.select().from(MenuItemMapping)
                                     .where(
                                         and(
                                             eq(MenuItemMapping.daily_menu_id, daily_menuId),
                                             eq(MenuItemMapping.menu_item_id, menuItemId)
                                         )
                                     )
                                     .then(row => row[0] || null)
    }

    async createMenuItemMapping(entity: MenuItemMappingEntity): Promise<MenuItemMappingRow> {
        const payload = MenuItemMappingMapper.toPersistence(entity);
        const [row] = await this.db.insert(MenuItemMapping)
                                   .values(payload)
                                   .returning();

        if (!row) {
            throw new InternalServerError("Failed to create menu item mapping");
        }
        return row;
    }

    async findById(id: string): Promise<MenuItemMappingRow | null> {
         return await this.db.select()
                     .from(MenuItemMapping)
                     .where(eq(MenuItemMapping.id, id))
                     .limit(1)
                     .then(rows => rows[0] ?? null);
    }
    async update(id: string, entity: MenuItemMappingEntity): Promise<MenuItemMappingRow | null> {
        const payload = MenuItemMappingMapper.toPersistence(entity);
        const [row] = await this.db.update(MenuItemMapping)
            .set({
                ...payload
            })
            .where(eq(MenuItemMapping.id, id))
            .returning();

        if (!row) {
            throw new InternalServerError("Failed to update menu item mapping");
        }
        return row;
    }
    async delete(id: string): Promise<number> {
        const result = await this.db.delete(MenuItemMapping)
                       .where(eq(MenuItemMapping.id, id));
        return result ? 1 : 0; // return 1 if deleted, 0 if not found
    }


async findAll(
  limit: number,
  page: number
): Promise<{ rows: MenuItemMappingRow[]; total: number }> {

  const offset = (page - 1) * limit;

  // ─── Fetch paginated rows ───────────────────
  const rows = await this.db
    .select()
    .from(MenuItemMapping)
    .orderBy(desc(MenuItemMapping.created_at))
    .limit(limit)
    .offset(offset);

  // ─── Fetch total count ──────────────────────
  const totalResult = await this.db
    .select({ count: count() })
    .from(MenuItemMapping);

  const total = totalResult[0]?.count ?? 0;

  return { rows, total };
}
}