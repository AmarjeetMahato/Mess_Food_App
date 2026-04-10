import { z } from "zod";


export const MenuItemMappingParamsSchemaParams = z.object({
  id: z.uuid("Invalid mapping ID"),
});


export const CreateMenuItemMappingSchema = z.object({
  id: z.uuid({message:"Invalid Id"}).optional(),
  daily_menu_id: z.uuid("Invalid daily menu ID"),

  menu_item_id: z.uuid("Invalid menu item ID"),

  quantity_description: z
    .string()
    .max(100, "Quantity description must be at most 100 characters")
    .optional(),
});

export const UpdateMenuItemMappingSchema = z
  .object({
    daily_menu_id: z.uuid("Invalid daily menu ID").optional(),

    menu_item_id: z.uuid("Invalid menu item ID").optional(),

    quantity_description: z
      .string()
      .max(100, "Quantity description must be at most 100 characters")
      .optional(),
  })
  .transform((data) =>
    Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    )
  );

export type MenuItemMappingParamsDto = z.infer<typeof MenuItemMappingParamsSchemaParams>;
export type CreateMenuItemMappingDto = z.infer<typeof CreateMenuItemMappingSchema>;
export type UpdateMenuItemMappingDto = z.infer<typeof UpdateMenuItemMappingSchema>;

export interface MenuItemMappingResponseDto {
  id: string;
  daily_menu_id: string;
  menu_item_id: string;
  quantity_description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface MenuItemMappingListResponseDto {
  items: MenuItemMappingResponseDto[];
  total: number;
}