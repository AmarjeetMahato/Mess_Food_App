import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, text,
  boolean, timestamp,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import {User} from "../user_and_auth/User"
// ─── Enums ────────────────────────────────────────────────────────────────────

export const notificationTypeEnum = pgEnum('notification_type', [
  // Meal
  'meal_reminder',           // upcoming meal in 30 min

  // Subscription
  'subscription_expiry',     // plan expiring in X days
  'pause_confirmed',         // subscription paused successfully
  'resume_confirmed',        // subscription resumed successfully

  // Wallet
  'recharge_success',        // wallet recharged successfully
  'low_balance',             // wallet balance low warning

  // Delivery
  'delivery_assigned',       // agent assigned to order
  'delivery_out_for_delivery', // agent on the way
  'delivery_delivered',      // meal delivered
  'delivery_failed',         // delivery attempt failed

  // Auth
  'otp',                     // OTP notification

  // Admin broadcast
  'general',                 // general announcement from admin
]);

export const notificationChannelEnum = pgEnum('notification_channel', [
  'push',      // FCM / APNS — via device_token
  'sms',       // SMS via Twilio / MSG91
  'email',     // email via SendGrid / SMTP
  'whatsapp',  // WhatsApp via Gupshup / Interakt
  'in_app',    // shown inside the app notification bell
]);

export const notificationStatusEnum = pgEnum('notification_status', [
  'pending',   // created, not yet sent
  'sent',      // dispatched to provider (FCM/SMS/etc)
  'delivered', // confirmed delivered by provider
  'failed',    // provider returned error
  'read',      // user opened/read the notification
]);

export const notificationReferenceTypeEnum = pgEnum('notification_reference_type', [
  'delivery_order',
  'subscription',
  'wallet',
  'otp_token',
  'daily_menu',
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const Notification = pgTable(
  'notifications',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),

    title: varchar('title', { length: 255 })
      .notNull(),
    // short heading — e.g. "Your lunch is on the way!"

    body: text('body')
      .notNull(),
    // full notification message

    type: notificationTypeEnum('type')
      .notNull(),

    channel: notificationChannelEnum('channel')
      .notNull(),
    // how this notification was / will be sent

    status: notificationStatusEnum('status')
      .default('pending')
      .notNull(),

    reference_id: uuid('reference_id'),
    // optional — links notification to a specific entity
    // e.g. delivery_order.id, subscription.id, wallet.id
    // no FK constraint — flexible across multiple tables

    reference_type: notificationReferenceTypeEnum('reference_type'),
    // tells you which table reference_id points to
    // used together with reference_id for deep linking in the app

    is_read: boolean('is_read')
      .default(false)
      .notNull(),
    // explicit flag — faster than checking read_at for null

    read_at: timestamp('read_at', { mode: 'date' }),
    // exact timestamp when user opened the notification

    sent_at: timestamp('sent_at', { mode: 'date' }),
    // when notification was dispatched to provider
    // null = not yet sent

    failed_reason: varchar('failed_reason', { length: 500 }),
    // provider error message — e.g. "Invalid FCM token", "SMS quota exceeded"
    // only filled when status = failed

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('notification_user_idx').on(table.user_id),
    index('notification_type_idx').on(table.type),
    index('notification_channel_idx').on(table.channel),
    index('notification_status_idx').on(table.status),
    index('notification_is_read_idx').on(table.is_read),
    index('notification_reference_idx').on(table.reference_id),
    index('notification_created_at_idx').on(table.created_at),

    // Composite — notification bell: all unread notifications for a user
    // WHERE user_id = ? AND is_read = false ORDER BY created_at DESC
    index('notification_user_is_read_idx').on(
      table.user_id,
      table.is_read,
    ),

    // Composite — notification history for a user sorted by date
    // WHERE user_id = ? ORDER BY created_at DESC
    index('notification_user_created_at_idx').on(
      table.user_id,
      table.created_at,
    ),

    // Composite — retry failed notifications
    // WHERE status = 'failed' AND channel = ?
    index('notification_status_channel_idx').on(
      table.status,
      table.channel,
    ),

    // Composite — find all notifications linked to a specific entity
    // WHERE reference_id = ? AND reference_type = ?
    index('notification_reference_type_idx').on(
      table.reference_id,
      table.reference_type,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const notificationRelations = relations(Notification, ({ one }) => ({
  user: one(User, {
    fields:     [Notification.user_id],
    references: [User.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type NotificationRow    = typeof Notification.$inferSelect;
export type NotificationInsert = typeof Notification.$inferInsert;