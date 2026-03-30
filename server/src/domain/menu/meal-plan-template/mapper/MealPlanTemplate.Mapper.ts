import { MealPlanTemplateInsert, MealPlanTemplateRow } from "@/config/models";
import { MealPlanEntity } from "../entity/MealPlan.Entity";
import { MealPlanTemplateResponseDto } from "../dtos/MealPlanTemplate";

export class MealPLanTemplateMapper{
    constructor(){}

      // ── MealPlanRow → MealPlanEntity ─────────────────────────

    static toDomain(row: MealPlanTemplateRow): MealPlanEntity {
        return new MealPlanEntity(
      row.id,
      row.day_number,
      row.slot,
      row.menu_item_id,
      row.is_active,
      row.created_by ?? "",
      row.created_at,
      row.updated_at,
        )
    }


  // ── MealPlanEntity → Response DTO ─────────────────────────
  static toResponseDto(entity: MealPlanEntity): MealPlanTemplateResponseDto {
    return {
      id: entity.id,
      day_number: entity.day_number,
      slot: entity.slot as 'breakfast' | 'lunch' | 'snacks' | 'dinner',
      menu_item_id: entity.menu_item_id,
      is_active: entity.is_active,
      created_by: entity.created_by,
      created_at: entity.created_at.toISOString(),
      updated_at: entity.updated_at.toISOString(),
    };
  }
}