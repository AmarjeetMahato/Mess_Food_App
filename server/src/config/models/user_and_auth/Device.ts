
import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { User } from './User';
import { Session } from './Sessions';

// ─── Enums ────────────────────────────────────────────────────────────────────
 
export const deviceTypeEnum = pgEnum('device_type', [
  'mobile',
  'tablet',
  'desktop',
  'unknown',
]);
 
export const devicePlatformEnum = pgEnum('device_platform', [
  'android',
  'ios',
  'web',
  'unknown',
]);
 
// ─── Drizzle Table Definition ─────────────────────────────────────────────────
 
export const Device = pgTable(
  'devices',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),
 
    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),
 
    device_token: varchar('device_token', { length: 500 })
      .notNull(),
    // FCM token (Android) or APNS token (iOS) — used for push notifications
 
    device_type: deviceTypeEnum('device_type')
      .default('unknown')
      .notNull(),
 
    platform: devicePlatformEnum('platform')
      .default('unknown')
      .notNull(),
 
    device_name: varchar('device_name', { length: 255 }),
    // e.g. "Rahul's iPhone 15"
 
    os_version: varchar('os_version', { length: 50 }),
    // e.g. "iOS 17.4" or "Android 14"
 
    app_version: varchar('app_version', { length: 50 }),
    // e.g. "2.1.0" — helps with version-specific bugs
 
    is_trusted: boolean('is_trusted')
      .default(false)
      .notNull(),
    // trusted device skips 2FA on next login
 
    is_active: boolean('is_active')
      .default(true)
      .notNull(),
 
    last_seen_at: timestamp('last_seen_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
 
    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('device_token_udx').on(table.device_token),
    index('device_user_id_idx').on(table.user_id),
    index('device_type_idx').on(table.device_type),
    index('device_platform_idx').on(table.platform),
    index('device_is_active_idx').on(table.is_active),
    index('device_is_trusted_idx').on(table.is_trusted),
    index('device_user_active_idx').on(table.user_id, table.is_active),
    // composite — fetch all active devices of a user
  ],
);


// ─── Relations ────────────────────────────────────────────────────────────────
 
export const deviceRelations = relations(Device, ({ one, many }) => ({
  user:     one(User,    { fields: [Device.user_id], references: [User.id] }),
  sessions: many(Session),
}));
 

export type DeviceRow    = typeof Device.$inferSelect;
export type DeviceInsert = typeof Device.$inferInsert;
