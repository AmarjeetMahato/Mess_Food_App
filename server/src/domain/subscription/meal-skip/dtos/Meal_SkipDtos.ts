import { z } from 'zod';

// ----------------------
// Enums
// ----------------------
export const mealSlotEnumZod = z.enum(['breakfast', 'lunch', 'snacks', 'dinner']);

// ----------------------
// Create DTO
// ----------------------
export const MealSkipCreateSchema = z.object({
  user_id: z.string({ message: "User ID is required" }),
  subscription_id: z.string({ message: "Subscription ID is required" }),
  daily_menu_id: z.string({ message: "Daily Menu ID is required" }),
  slot: mealSlotEnumZod,
  skip_date: z.string({ message: "Skip date is required" }).refine(
    (val) => !isNaN(Date.parse(val)), { message: "Invalid date format" }
  ),
  reason: z.string().max(500).optional(),
  wallet_credit_amount: z.number().optional().default(0),
  is_wallet_credited: z.boolean().optional().default(false),
});

// ----------------------
// Update DTO
// ----------------------
export const MealSkipUpdateSchema = z.object({
  reason: z.string().max(500).optional(),
  wallet_credit_amount: z.number().optional(),
  is_wallet_credited: z.boolean().optional(),
});

// ----------------------
// Params DTO
// ----------------------
export const MealSkipParamsSchema = z.object({
  id: z.string({ message: "Meal skip ID is required" }),
});

// ----------------------
// Response DTO
// ----------------------
export const MealSkipResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  subscription_id: z.string(),
  daily_menu_id: z.string(),
  slot: mealSlotEnumZod,
  skip_date: z.string(), // ISO date string
  reason: z.string().max(500).nullable().optional(),
  wallet_credit_amount: z.number(),
  is_wallet_credited: z.boolean(),
  created_at: z.string(), // ISO timestamp string
  updated_at: z.string()
});

export type MealSkipResponseSchemaDto = z.infer<typeof MealSkipResponseSchema>
export type MealSkipUpdateSchemaDto = z.infer<typeof MealSkipUpdateSchema>
// ----------------------
// Array Response DTO (for list endpoints)
// ----------------------
export const MealSkipArrayResponseSchema = z.array(MealSkipResponseSchema);

export type MealSkipCreateSchemaDto = z.infer<typeof MealSkipCreateSchema>;


export type mealSlotEnumZodDto = z.infer<typeof mealSlotEnumZod>