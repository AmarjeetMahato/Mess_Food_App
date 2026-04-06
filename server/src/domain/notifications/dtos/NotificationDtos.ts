import { z } from 'zod';

// Optional date fields for update schema
const optionalDate = z
  .preprocess((val) => (val ? new Date(val as string) : undefined), z.date().optional());

// Nullable date fields for response schema
const nullableDate = z
  .preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable());
// ----------------------
// ZOD ENUMS (mirror your PG enums)
// ----------------------
export const notificationTypeZodEnum = z.enum([
  'meal_reminder',
  'subscription_expiry',
  'pause_confirmed',
  'resume_confirmed',
  'recharge_success',
  'low_balance',
  'delivery_assigned',
  'delivery_out_for_delivery',
  'delivery_delivered',
  'delivery_failed',
  'otp',
  'general',
]);

export type notificationTypeZodEnumDto = z.infer<typeof notificationTypeZodEnum>

export const notificationChannelZodEnum = z.enum([
  'push',
  'sms',
  'email',
  'whatsapp',
  'in_app',
]);

export type notificationChannelZodEnumDto = z.infer<typeof notificationChannelZodEnum>


export const notificationStatusZodEnum = z.enum([
  'pending',
  'sent',
  'delivered',
  'failed',
  'read',
]);

export type notificationStatusZodEnumDto = z.infer<typeof notificationStatusZodEnum>


export const notificationReferenceTypeZodEnum = z.enum([
  'delivery_order',
  'subscription',
  'wallet',
  'otp_token',
  'daily_menu',
]);

export type notificationReferenceTypeZodEnumDto = z.infer<typeof notificationReferenceTypeZodEnum>


// ----------------------
// CREATE SCHEMA
// ----------------------
export const createNotificationSchema = z.object({
  id: z.string({message:"Id should be string"}).optional(),  
  user_id: z.string({ message: 'Invalid user_id UUID' }),
  title: z.string().min(1).max(255),
  body: z.string().min(1),
  type: notificationTypeZodEnum,
  channel: notificationChannelZodEnum,
  reference_id: z.string().optional(),
  reference_type: notificationReferenceTypeZodEnum.optional(),
  created_at:optionalDate
});

// ----------------------
// UPDATE SCHEMA
// ----------------------

export const updateNotificationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  body: z.string().min(1).optional(),
  type: notificationTypeZodEnum.optional(),
  channel: notificationChannelZodEnum.optional(),
  status: notificationStatusZodEnum.optional(),
  reference_id: z.string().optional(),
  reference_type: notificationReferenceTypeZodEnum.optional(),
  is_read: z.boolean().optional(),
  read_at: optionalDate,
  sent_at: optionalDate,
  failed_reason: z.string().max(500).optional(),
});

// ----------------------
// PARAMS SCHEMA
// ----------------------
export const notificationParamsSchema = z.object({
  id: z.string({ message: 'Invalid notification id UUID' }),
});

// ----------------------
// RESPONSE SCHEMA
// ----------------------
export const notificationResponseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  body: z.string(),
  type: notificationTypeZodEnum,
  channel: notificationChannelZodEnum,
  status: notificationStatusZodEnum,
  reference_id: z.string().nullable(),
  reference_type: notificationReferenceTypeZodEnum.nullable(),
  is_read: z.boolean(),
  read_at: z.date().nullable(),
  sent_at: z.date().nullable(),
  failed_reason: z.string().nullable(),
  created_at: z.date(),
});

// ----------------------
// TYPES
// ----------------------
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationInput = z.infer<typeof updateNotificationSchema>;
export type NotificationParams = z.infer<typeof notificationParamsSchema>;
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;