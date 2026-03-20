import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, numeric,
  boolean, timestamp,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { DeliveryOrder } from './delivery-order';
import { User } from '../user_and_auth/User';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const locationLabelEnum = pgEnum('location_label', [
  'home',
  'hostel',
  'office',
  'other',
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const DeliveryLocation = pgTable(
  'delivery_locations',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),

    label: locationLabelEnum('label')
      .default('home')
      .notNull(),
    // home | hostel | office | other

    address: varchar('address', { length: 500 })
      .notNull(),
    // full address string

    block: varchar('block', { length: 100 }),
    // e.g. "Block B", "Wing C"

    room_no: varchar('room_no', { length: 50 }),
    // e.g. "204", "Room 12A"

    floor: varchar('floor', { length: 50 }),
    // e.g. "2nd Floor", "Ground Floor"

    landmark: varchar('landmark', { length: 255 }),
    // e.g. "Near main gate", "Opposite canteen"

    lat: numeric('lat', { precision: 10, scale: 7 })
      .notNull(),
    // GPS latitude — precision: 10, scale: 7 gives ~1cm accuracy

    lng: numeric('lng', { precision: 10, scale: 7 })
      .notNull(),
    // GPS longitude

    is_default: boolean('is_default')
      .default(false)
      .notNull(),
    // user's primary delivery address
    // only one can be default at a time — enforced at service layer

    is_active: boolean('is_active')
      .default(true)
      .notNull(),
    // soft delete — user can remove saved addresses

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('location_user_idx').on(table.user_id),
    index('location_label_idx').on(table.label),
    index('location_is_default_idx').on(table.is_default),
    index('location_is_active_idx').on(table.is_active),

    // Composite — fetch all active saved addresses for a user
    // WHERE user_id = ? AND is_active = true
    index('location_user_active_idx').on(
      table.user_id,
      table.is_active,
    ),

    // Composite — get user's default address
    // WHERE user_id = ? AND is_default = true AND is_active = true
    index('location_user_default_active_idx').on(
      table.user_id,
      table.is_default,
      table.is_active,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const deliveryLocationRelations = relations(DeliveryLocation, ({ one, many }) => ({
  user: one(User, {
    fields:     [DeliveryLocation.user_id],
    references: [User.id],
  }),
  deliveryOrders: many(DeliveryOrder),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryLocationRow    = typeof DeliveryLocation.$inferSelect;
export type DeliveryLocationInsert = typeof DeliveryLocation.$inferInsert;