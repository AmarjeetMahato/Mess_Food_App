import type { DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import { inject, injectable } from "tsyringe";
import { IMealPlanTemplateRepository } from "./IMealPlanTemplate.Repository";
import { MealPlanTemplate, MealPlanTemplateRow } from "@/config/models";
import { CreateMealPlanTemplateDto, MealPlanTemplateResponseDto, UpdateMealPlanTemplateDto } from "../dtos/MealPlanTemplate";
import { InternalServerError } from "@/globalError/AppError";
import { MealPLanTemplateMapper } from "../mapper/MealPlanTemplate.Mapper";
import { eq } from "drizzle-orm";


@injectable()
export class MealPlanTemplateRepository implements IMealPlanTemplateRepository {
    constructor(@inject(TOKENS.DB) private db: DbOrTx){}


   async  createMealTemplate(dto: CreateMealPlanTemplateDto, adminId: string): Promise<MealPlanTemplateRow> {
        const [row] = await this.db.insert(MealPlanTemplate).values({
            day_number: dto.day_number,
            slot:       dto.slot,
            menu_item_id: dto.menu_item_id,
            is_active:   true,
            created_by:  adminId,
        }).returning();
        
          if (!row) {
    throw new InternalServerError("Failed to create meal template");
  }
     return row;
    }


    async findById(id: string): Promise<MealPlanTemplateRow | null> {
        return  await this.db.select()
                   .from(MealPlanTemplate)
                   .where(eq(MealPlanTemplate.id, id))
                   .limit(1).then(rows => rows[0] ?? null);
    }

    findByDayAndSlot(day_number: number, slot: string): Promise<MealPlanTemplateRow[]> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<MealPlanTemplateRow[]> {
        throw new Error("Method not implemented.");
    }
     async update(id: string, dto:UpdateMealPlanTemplateDto, adminId:string): Promise<MealPlanTemplateRow | null> {
         const [row] = await this.db.update(MealPlanTemplate)
                                 .set({
                                     ...dto,
                                     created_by: adminId, // track which admin made the update
                                     updated_at: new Date(), // timestamp for audit trail
                                 })
                                 .where(eq(MealPlanTemplate.id, id))
                                 .returning();
        return row || null;
    }

    async delete(id: string): Promise<number> {
        const [row] = await this.db.delete(MealPlanTemplate)
                                 .where(eq(MealPlanTemplate.id, id))
                                 .returning();
        return row ? 1 : 0;
    }


    
}