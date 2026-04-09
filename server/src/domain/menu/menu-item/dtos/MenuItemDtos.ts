// src/modules/menu/dto/menu-item.dto.ts
// Standalone DTO for MenuItem — no imports from menu.dto.ts
// Zod v4 compatible

import { z } from 'zod';

// ─── Shared enum values ───────────────────────────────────────────────────────

export const FOOD_CATEGORIES = ['veg', 'non_veg', 'egg'] as const;
export type  FoodCategory    = typeof FOOD_CATEGORIES[number];

export const CreateMenuItemSchemaParams = z.object({
    id: z.string({message:"Invalid id formate"})
})

// ─── Request Schemas ──────────────────────────────────────────────────────────

export const CreateMenuItemSchema = z.object({
  id: z.string({message:"Invalid Id formate"}).optional(),
  name: z
    .string({ error: 'Name is required' })
    .min(2,   'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters')
    .transform((val) => val.trim()),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  category: z.enum(FOOD_CATEGORIES, {
    error: `Category must be one of: ${FOOD_CATEGORIES.join(', ')}`,
  }),

  image_url: z
    .url('Invalid image URL')
    .max(500, 'Image URL must not exceed 500 characters')
    .optional(),

  is_available: z.boolean().default(true),
});

export const UpdateMenuItemSchema = z.object({
  name: z
    .string()
    .min(2,   'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters')
    .transform((val) => val.trim())
    .optional(),

  description: z
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),

  category: z.enum(FOOD_CATEGORIES).optional(),

  image_url: z
    .url('Invalid image URL')
    .max(500)
    .optional(),

  is_available: z.boolean().optional(),

}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: 'At least one field must be provided to update' },
);

export const GetMenuItemSchema = z.object({
  id: z.uuid('Invalid menu item ID format'),
});

export const ListMenuItemsSchema = z.object({
  category: z.enum(FOOD_CATEGORIES).optional(),

  is_available: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),

  search: z
    .string()
    .max(100, 'Search must not exceed 100 characters')
    .transform((val) => val.trim())
    .optional(),
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type CreateMenuItemDto = z.infer<typeof CreateMenuItemSchema>;
export type UpdateMenuItemDto = z.infer<typeof UpdateMenuItemSchema>;
export type GetMenuItemDto    = z.infer<typeof GetMenuItemSchema>;
export type ListMenuItemsDto  = z.infer<typeof ListMenuItemsSchema>;

// ─── Response DTOs ────────────────────────────────────────────────────────────

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

export interface MenuItemListResponseDto {
  items: MenuItemResponseDto[];
  total: number;
}