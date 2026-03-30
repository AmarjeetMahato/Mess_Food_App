 
import { z } from 'zod';
 
// ─── Shared enum values ───────────────────────────────────────────────────────
 
export const MEAL_SLOTS     = ['breakfast', 'lunch', 'snacks', 'dinner'] as const;
export const FOOD_CATEGORIES = ['veg', 'non_veg', 'egg']                 as const;
 
export type MealSlot     = typeof MEAL_SLOTS[number];
export type FoodCategory = typeof FOOD_CATEGORIES[number];
 

 
// ─── Daily Menu Schemas ───────────────────────────────────────────────────────
 
export const CreateDailyMenuSchema = z.object({
  menu_date: z.coerce.date({
    error: 'Valid date is required',
  }),
 
  slot: z.enum(MEAL_SLOTS, {
    error: `Slot must be one of: ${MEAL_SLOTS.join(', ')}`,
  }),
 
  item_ids: z
    .array(z.uuid('Invalid menu item ID'))
    .min(1, 'At least one menu item is required'),
  // item_ids mapped to menu_item_mappings table
});
 
export const UpdateDailyMenuSchema = z.object({
  is_active: z.boolean().optional(),
 
  item_ids: z
    .array(z.uuid('Invalid menu item ID'))
    .min(1, 'At least one item required')
    .optional(),
 
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided to update' },
);

export const GetThreeDayMenuSchema = z.object({
  start_date: z.coerce.date({
    error: "Valid start date is required",
  }),
});

export type GetThreeDayMenuDto = z.infer<typeof GetThreeDayMenuSchema>;


export type CreateDailyMenuDto        = z.infer<typeof CreateDailyMenuSchema>;
export type UpdateDailyMenuDto        = z.infer<typeof UpdateDailyMenuSchema>;


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
 

export interface MenuItemInSlotDto {
  id:           string;
  name:         string;
  description:  string | null;
  category:     FoodCategory;
  image_url:    string | null;
  is_available: boolean;
}


export interface ActiveOrDeactivateResponse {
  id: string;
  is_active: boolean;
}