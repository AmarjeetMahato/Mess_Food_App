import { z } from "zod";

export const FeedbackParamsSchema = z.object({
  id: z.uuid("Invalid feedback ID"),
});

export const CreateFeedbackSchema = z.object({

  daily_menu_id: z.uuid("Invalid daily menu ID"),

  menu_item_id: z.uuid("Invalid menu item ID"),

  rating: z
    .number("Rating must be a number")
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must not exceed 5"),

  comment: z
    .string()
    .max(1000, "Comment too long")
    .optional(),
});

export const UpdateFeedbackSchema = z
  .object({
    rating: z
      .number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must not exceed 5")
      .optional(),

    comment: z
      .string()
      .max(1000, "Comment too long")
      .optional(),
  })
  .transform((data) =>
    Object.fromEntries(
      Object.entries(data).filter(([_, v]) => v !== undefined)
    )
  );

export type FeedbackParamsDto = z.infer<typeof FeedbackParamsSchema>;
export type CreateFeedbackDto = z.infer<typeof CreateFeedbackSchema>;
export type UpdateFeedbackDto = z.infer<typeof UpdateFeedbackSchema>;


export const FeedbackQuerySchema = z.object({
  daily_menu_id: z.uuid().optional(),
  menu_item_id: z.uuid().optional(),

  min_rating: z.coerce.number().min(1).max(5).optional(),
  max_rating: z.coerce.number().min(1).max(5).optional(),
});

export interface FeedbackResponseDto {
  id: string;
  user_id: string;
  daily_menu_id: string;
  menu_item_id: string;
  rating: number;
  comment?: string | null;
  created_at: Date; // ISO string
}