import { z } from 'zod';
import { MEAL_SLOTS } from '../../daily-menu/dtos/DailyMenuDtos';


export const CreateMealPlanTemplateSchemaParams = z.object({
   id:z.string('Invalid meal plan template ID')
})

// ─── Meal Plan Template Schemas ───────────────────────────────────────────────
 
export const CreateMealPlanTemplateSchema = z.object({
  day_number: z.coerce
    .number()
    .int('Day number must be an integer')
    .min(1, 'Day number must be at least 1')
    .max(3, 'Day number must not exceed 3'),
  // rotating 3-day plan
 
  slot: z.enum(MEAL_SLOTS, {
    error: `Slot must be one of: ${MEAL_SLOTS.join(', ')}`,
  }),
 
  menu_item_id: z.uuid('Invalid menu item ID'),

   created_by:z.string("User Id  must be a string")
});


export const UpdateMealPlanTemplateSchema = z.object({
  day_number: z.coerce
    .number()
    .int()
    .min(1)
    .max(3)
    .optional(),

  slot: z.enum(MEAL_SLOTS).optional(),

  menu_item_id: z.uuid().optional(),

  is_active: z.boolean().optional(), // ✅ allow activation toggle
})
.transform((data) =>
  Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  )
);

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type CreateMealPlanTemplateDto = z.infer<typeof CreateMealPlanTemplateSchema>;
export type UpdateMealPlanTemplateDto = z.infer<typeof UpdateMealPlanTemplateSchema>;
 
// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface MealPlanTemplateResponseDto {
  id: string;
  day_number: number;
  slot: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  menu_item_id: string;
  is_active: boolean;
  created_by:string;
  created_at: string;
  updated_at: string;
}


 
export interface MenuItemResponseDto {
  id:           string;
  name:         string;
  description:  string | null;
  category:     string;
  image_url:    string | null;
  is_available: boolean;
  created_at:   string;
  updated_at:   string;
}
 
export interface DailyMenuResponseDto {
  id:         string;
  menu_date:  string;
  slot:       string;
  is_active:  boolean;
  items:      MenuItemResponseDto[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
 
export interface ThreeDayMenuResponseDto {
  date:  string;
  slots: {
    breakfast: DailyMenuResponseDto | null;
    lunch:     DailyMenuResponseDto | null;
    snacks:    DailyMenuResponseDto | null;
    dinner:    DailyMenuResponseDto | null;
  };
}
 
// export interface MealPlanTemplateResponseDto {
//   id:           string;
//   day_number:   number;
//   slot:         string;
//   menu_item:    MenuItemResponseDto;
//   is_active:    boolean;
//   created_at:   string;
//   updated_at:   string;
// }
 
export interface FeedbackResponseDto {
  id:            string;
  user_id:       string;
  daily_menu_id: string;
  menu_item_id:  string;
  rating:        number;
  comment:       string | null;
  created_at:    string;
}
 
export interface MenuItemListResponseDto {
  items: MenuItemResponseDto[];
  total: number;
}
