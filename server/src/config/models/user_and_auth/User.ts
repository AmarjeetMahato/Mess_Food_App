import { relations } from 'drizzle-orm';
import {pgTable,uuid,varchar, boolean,timestamp,index,uniqueIndex,pgEnum,} from 'drizzle-orm/pg-core';
import { Role } from './Role';
import {Session} from "./Sessions"
import { Device } from './Device';
import {OauthAccount} from "./OauthAccount"
import {OtpToken}  from "./OTP_Token"
import { Wallet } from '../wallet';
import {Subscription,MealSkip,MealAttendance} from "../subscription"
import {DeliveryOrder,DeliveryLocation, DeliveryAgent} from "../delivery_and_tracking"
import {Feedback} from "../menu"
import {Notification} from "../notifications"
import { UserAddress } from './Address';

export const userStatusEnum = pgEnum('user_status', [
  'active',
  'inactive',
  'banned',
  'pending_verification',
]);
 

export const User = pgTable('users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }),
    phone: varchar('phone', { length: 20 }),
    password_hash: varchar('password_hash', { length: 255 }),
    role_id: uuid('role_id').references(() => Role.id, { onDelete: 'restrict' }).notNull(),
    status: userStatusEnum('status').default('pending_verification').notNull(),
    is_email_verified: boolean('is_email_verified').default(false).notNull(),
    is_phone_verified: boolean('is_phone_verified').default(false).notNull(),
    avatar_url: varchar('avatar_url', { length: 500 }),
    last_login_at: timestamp('last_login_at', { mode: 'date' }),
    created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updated_at: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_email_udx').on(table.email),
    uniqueIndex('user_phone_udx').on(table.phone),
    index('user_role_idx').on(table.role_id),
    index('user_status_idx').on(table.status),
    index('user_is_email_verified_idx').on(table.is_email_verified),
    index('user_is_phone_verified_idx').on(table.is_phone_verified),
    index('user_created_at_idx').on(table.created_at),
  ],
);


// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(User, ({ one, many }) => ({
  // ── auth_and_users ────────────────────────────────────────────────────
  role:          one(Role,        { fields: [User.role_id], references: [Role.id] }),
  sessions:      many(Session),
  devices:       many(Device),
  oauthAccounts: many(OauthAccount),
  otpTokens:     many(OtpToken),

  // ── Adddress ──────────────────────────────────────────────────────────
  address: many(UserAddress),

  // ── wallet ────────────────────────────────────────────────────────────
  wallet:        one(Wallet),

  // ── subscription ──────────────────────────────────────────────────────
  subscriptions: many(Subscription),
  mealSkips:     many(MealSkip),
  attendances:   many(MealAttendance),

  // ── delivery_and_tracking ─────────────────────────────────────────────
  deliveryOrders:    many(DeliveryOrder),
  deliveryLocations: many(DeliveryLocation),
  deliveryAgent:     one(DeliveryAgent),   // only drivers have this — null for regular users

  // ── notifications ─────────────────────────────────────────────────────
  notifications: many(Notification),

  // ── menu ──────────────────────────────────────────────────────────────
  feedbacks:     many(Feedback),
}));

export type UserRow    = typeof User.$inferSelect;
export type UserInsert = typeof User.$inferInsert;