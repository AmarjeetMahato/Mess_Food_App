import { string, z } from "zod";


export const createSubscriptionParamsSchema = z.object({
      id:string({message:"Invalid params formate"})
})

// reuse enum values (keep in sync with DB)
export const planTypeEnumSchema = z.enum(["daily", "weekly", "monthly"], {
  message: "Invalid plan type",
});

export const subscriptionStatusEnumSchema = z.enum(
  ["active", "paused", "expired", "cancelled"],
  {
    message: "Invalid subscription status",
  }
);

export const createSubscriptionSchema = z.object({
  userId: z.string({message: "Invalid userId format" }),

  planType: planTypeEnumSchema,
  status: subscriptionStatusEnumSchema.optional().default("active"),

  startDate: z.coerce.date({message: "Invalid start date"}),

  endDate: z.coerce.date({message: "Invalid end date"}),

  totalDays: z.number({message: "totalDays must be a number",})
    .int({ message: "totalDays must be an integer" })
    .positive({ message: "totalDays must be greater than 0" }),

  // optional (auto-calculated in service ideally)
  consumedDays: z.number().int().min(0, { message: "consumedDays cannot be negative" }).optional().default(0),

  remainingDays: z.number().int().min(0, { message: "remainingDays cannot be negative" }),

  // slot selection
  hasBreakfast: z.boolean({message: "hasBreakfast must be boolean"}),

  hasLunch: z.boolean({message: "hasLunch must be boolean"}),

  hasDinner: z.boolean({message: "hasDinner must be boolean"}),

  hasSnacks: z.boolean({message: "hasSnacks must be boolean"}),

  autoRenew: z.boolean({message: "autoRenew must be boolean"}).optional().default(false),
})
.refine(
  (data) => data.endDate > data.startDate,
  {
    message: "endDate must be greater than startDate",
    path: ["endDate"],
  }
)
.refine(
  (data) =>
    data.hasBreakfast ||
    data.hasLunch ||
    data.hasDinner ||
    data.hasSnacks,
  {
    message: "At least one meal slot must be selected",
    path: ["hasBreakfast"],
  }
);

export const updateSubscriptionSchema = z.object({
  status: subscriptionStatusEnumSchema.optional(),

  endDate: z.coerce.date({message: "Invalid end date"}).optional(),

  consumedDays: z.number().int().min(0, { message: "consumedDays cannot be negative" }).optional(),

  remainingDays: z.number().int().min(0, { message: "remainingDays cannot be negative" }).optional(),

  autoRenew: z.boolean({message: "autoRenew must be boolean"}).optional(),

});

export const subscriptionResponseSchema = z.object({
  id: z.string(),

  userId: z.string(),

  planType: planTypeEnumSchema,
  status: subscriptionStatusEnumSchema,

  startDate: z.date(),
  endDate: z.date(),

  totalDays: z.number(),
  consumedDays: z.number(),
  remainingDays: z.number(),

  hasBreakfast: z.boolean(),
  hasLunch: z.boolean(),
  hasDinner: z.boolean(),
  hasSnacks: z.boolean(),

  autoRenew: z.boolean(),

  createdAt: z.date(),
  updatedAt: z.date(),
});


export type subscriptionStatusEnumSchemaDto = z.infer< typeof subscriptionStatusEnumSchema>
export type CreateSubscriptionDto = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionDto = z.infer<typeof updateSubscriptionSchema>;
export type SubscriptionResponseDto = z.infer<typeof subscriptionResponseSchema>;