import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar,
  boolean, timestamp,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { User } from './User';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const addressTypeEnum = pgEnum('address_type', [
  'home',       // permanent home address
  'college',    // college / campus address
  'hostel',     // hostel address
  'office',     // office / workplace
  'other',
]);

// ─── Table ────────────────────────────────────────────────────────────────────
// Permanent profile address — NOT related to food delivery
// This is who the user IS and WHERE they live
// delivery_locations = where to SEND the food (can change per order)
// user_address       = permanent address on profile (changes rarely)

export const UserAddress = pgTable(
  'user_addresses',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),

    address_type: addressTypeEnum('address_type')
      .default('home')
      .notNull(),

    address_line_1: varchar('address_line_1', { length: 500 })
      .notNull(),
    // e.g. "Room 204, Block B" or "12, MG Road"

    address_line_2: varchar('address_line_2', { length: 500 }),
    // optional — apartment, suite, unit etc.

    landmark: varchar('landmark', { length: 255 }),
    // e.g. "Near main gate", "Opposite SBI Bank"

    city: varchar('city', { length: 100 })
      .notNull(),

    state: varchar('state', { length: 100 })
      .notNull(),

    pincode: varchar('pincode', { length: 10 })
      .notNull(),
    // using varchar not integer — some pincodes have leading zeros
    // e.g. "400001" (Mumbai), "831001" (Jamshedpur)

    country: varchar('country', { length: 100 })
      .default('India')
      .notNull(),

    is_primary: boolean('is_primary')
      .default(false)
      .notNull(),
    // one primary address per user — enforced at service layer
    // shown first on profile

    is_active: boolean('is_active')
      .default(true)
      .notNull(),
    // soft delete — user can remove address without losing history

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('user_address_user_idx').on(table.user_id),
    index('user_address_type_idx').on(table.address_type),
    index('user_address_city_idx').on(table.city),
    index('user_address_pincode_idx').on(table.pincode),
    index('user_address_is_active_idx').on(table.is_active),

    // Composite — fetch all active addresses for a user
    // WHERE user_id = ? AND is_active = true
    index('user_address_user_active_idx').on(
      table.user_id,
      table.is_active,
    ),

    // Composite — get user's primary address fast
    // WHERE user_id = ? AND is_primary = true AND is_active = true
    index('user_address_user_primary_active_idx').on(
      table.user_id,
      table.is_primary,
      table.is_active,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const userAddressRelations = relations(UserAddress, ({ one }) => ({
  user: one(User, {
    fields:     [UserAddress.user_id],
    references: [User.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type UserAddressRow    = typeof UserAddress.$inferSelect;
export type UserAddressInsert = typeof UserAddress.$inferInsert;