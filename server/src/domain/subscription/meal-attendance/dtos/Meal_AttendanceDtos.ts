import { z } from "zod";

export const mealSlotEnum = z.enum(["breakfast","lunch","snacks","dinner"]);

export const createMealAttendanceSchema = z.object({
  userId: z.string({ message: "Invalid userId format" }),
  subscriptionId: z.string({ message: "Invalid subscriptionId format" }),
  dailyMenuId: z.string({ message: "Invalid dailyMenuId format" }),

   slot: z.enum(["breakfast", "lunch", "snacks", "dinner"], {
    message: "Invalid meal slot",
  }),

  attendanceDate: z.coerce.date({
    message: "Invalid attendance date",
  }),

  isConsumed: z.boolean().optional(),
  scannedAt: z.coerce.date().optional(),
  scannedBy: z.string({ message: "Invalid scannedBy userId" }).optional(),
  createdBy: z.string({ message: "Invalid createdBy userId" }),
});

export const updateMealAttendanceSchema = z.object({
  isConsumed: z.boolean({message:"isConsumed must be a boolean"}).optional(),
  scannedAt: z.coerce.date({message: "Invalid scannedAt date"}).optional(),
  scannedBy: z.string({ message: "Invalid scannedBy userId" }).optional(),
  updatedBy: z.string({ message: "Invalid updatedBy userId" }).optional()
});

export type createMealAttendanceSchemaDto = z.infer<typeof createMealAttendanceSchema>
export type updateMealAttendanceSchemaDto = z.infer<typeof updateMealAttendanceSchema>
// ✅ infer the TS type from Zod enum
export type MealSlotEnumType = z.infer<typeof mealSlotEnum>;


export const mealAttendanceResponseSchema = z.object({
  id: z.string(),

  userId: z.string(),
  subscriptionId: z.string(),
  dailyMenuId: z.string(),

  slot: z.enum(["breakfast", "lunch", "snacks", "dinner"]),

  attendanceDate: z.date(),

  isConsumed: z.boolean(),

  scannedAt: z.date().nullable(),
  scannedBy: z.string().nullable(),

  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date(),
});


export type mealAttendanceResponseSchemaDto = z.infer<typeof mealAttendanceResponseSchema>