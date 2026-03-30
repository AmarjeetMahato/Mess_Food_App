import { inject, injectable } from "tsyringe";
import { IMenuItemMappingRepository } from "./IMenuItemMappingRepository";
import { MenuItemMapping, MenuItemMappingRow } from "@/config/models";
import { CreateMenuItemMappingDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";
import { TOKENS } from "@/helper/user_and_auth/token";
import type { DbOrTx } from "@/config/database/database";
import { InternalServerError } from "@/globalError/AppError";
import { eq } from "drizzle-orm";

@injectable()
export class MenuItemMappingRepository implements IMenuItemMappingRepository {
   
    constructor(@inject(TOKENS.DB) private db:DbOrTx){}

    async createMenuItemMapping(dto: CreateMenuItemMappingDto): Promise<MenuItemMappingRow> {
        const [row] = await this.db.insert(MenuItemMapping).values({
            daily_menu_id: dto.daily_menu_id,
            menu_item_id: dto.menu_item_id,
            quantity_description: dto.quantity_description,
        }).returning();

        if (!row) {
            throw new InternalServerError("Failed to create menu item mapping");
        }
        return row;
    }

    async findById(id: string): Promise<MenuItemMappingRow | null> {
         return await this.db.select()
                     .from(MenuItemMapping)
                     .where(eq(MenuItemMapping.id, id))
                        .limit(1).then(rows => rows[0] ?? null);
    }
    async update(id: string, dto: UpdateMenuItemMappingDto): Promise<MenuItemMappingRow | null> {
        const [row] = await this.db.update(MenuItemMapping)
            .set({
                daily_menu_id: dto.daily_menu_id,
                menu_item_id: dto.menu_item_id,
                quantity_description: dto.quantity_description,
                updated_at: new Date(), // update timestamp for audit trail
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
    findAll(): Promise<MenuItemMappingRow[]> {
        throw new Error("Method not implemented.");
    }
}