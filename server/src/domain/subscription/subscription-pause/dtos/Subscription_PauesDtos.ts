import { z } from "zod";

export const createSubscriptionPauseSchema = z.object({

  subscriptionId: z
    .string({ message: "Subscription ID is required" }),

  pausedBy: z
    .string({ message: "PausedBy user ID is required" })
    .optional(),

  pauseStart: z.coerce.date({
    message: "Invalid pause start date",
  }),

  pauseEnd: z
    .coerce.date({
      message: "Invalid pause end date",
    })
    .optional(),

  reason: z
    .string({ message: "Reason must be a string" })
    .max(500, { message: "Reason cannot exceed 500 characters" })
    .optional(),

}).refine(
  (data) => {
    if (data.pauseEnd) {
      return data.pauseEnd >= data.pauseStart;
    }
    return true;
  },
  {
    message: "pauseEnd must be greater than or equal to pauseStart",
    path: ["pauseEnd"],
  }
);

export const resumeSubscriptionPauseSchema = z.object({

  pauseId: z
    .string({ message: "Pause ID is required" })
    .uuid({ message: "Invalid pause ID format" }),

  resumedAt: z
    .coerce.date({
      message: "Invalid resumedAt date",
    })
    .optional(),

});

export const updateSubscriptionPauseSchema = z.object({

  pauseEnd: z
    .coerce.date({
      message: "Invalid pause end date",
    })
    .optional(),

  reason: z
    .string({ message: "Reason must be a string" })
    .max(500, { message: "Reason cannot exceed 500 characters" })
    .optional(),

  isResumed: z
    .boolean({ message: "isResumed must be boolean" })
    .optional(),

});




export type UpdateSubscriptionPauseDto = z.infer<typeof updateSubscriptionPauseSchema>;
export type CreateSubscriptionPauseDto = z.infer<typeof createSubscriptionPauseSchema>;
export type ResumeSubscriptionPauseDto = z.infer<typeof resumeSubscriptionPauseSchema>;


export const subscriptionPauseResponseSchema = z.object({

  id: z.string(),

  subscriptionId: z.string(),

  pausedBy: z.string().nullable(),

  pauseStart: z.date(),

  pauseEnd: z.date().nullable(),

  reason: z.string().nullable(),

  isResumed: z.boolean(),

  resumedAt: z.date().nullable(),

  daysPaused: z.string().nullable(),

  createdAt: z.date(),

});

export const subscriptionPauseQuerySchema = z.object({

  subscriptionId: z.string().optional(),

  isResumed: z.boolean().optional(),

  fromDate: z.coerce.date().optional(),

  toDate: z.coerce.date().optional(),

});

export type SubscriptionPauseQueryDto = z.infer<typeof subscriptionPauseQuerySchema>;
export type SubscriptionPauseResponseDto = z.infer<typeof subscriptionPauseResponseSchema>;