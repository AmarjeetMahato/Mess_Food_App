import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, date,
  timestamp, index, pgEnum,
} from 'drizzle-orm/pg-core';
import { DeliveryAgent } from './delivery-agent';
import { DeliveryTrackingLog } from './delivery-tracking-log';
import { User } from '../user_and_auth/User';
import { DeliveryLocation } from './delivery-location';
import {Subscription}  from "../subscription/subscription"
import { DailyMenu, mealSlotEnum } from '../menu/daily-menu';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const deliveryStatusEnum = pgEnum('delivery_status', [
  'pending',          // order created, no agent assigned yet
  'assigned',         // agent assigned by admin
  'picked_up',        // agent picked up the meal from mess
  'out_for_delivery', // agent is on the way
  'delivered',        // meal handed to user
  'failed',           // delivery attempt failed
  'cancelled',        // order cancelled by user or admin
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const DeliveryOrder = pgTable(
  'delivery_orders',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),

    subscription_id: uuid('subscription_id')
      .references(() => Subscription.id, { onDelete: 'restrict' })
      .notNull(),
    // restrict — dont delete subscription if delivery orders exist

    agent_id: uuid('agent_id')
      .references(() => DeliveryAgent.id, { onDelete: 'set null' }),
    // null = not yet assigned to an agent

    location_id: uuid('location_id')
      .references(() => DeliveryLocation.id, { onDelete: 'restrict' })
      .notNull(),
    // restrict — dont delete location if it has delivery orders

    daily_menu_id: uuid('daily_menu_id')
      .references(() => DailyMenu.id, { onDelete: 'restrict' })
      .notNull(),
    // which menu slot is being delivered

    slot: mealSlotEnum('slot')
      .notNull(),
    // reusing enum — breakfast | lunch | snacks | dinner
    // kept directly on order for fast queries without joining daily_menu

    delivery_date: date('delivery_date', { mode: 'date' })
      .notNull(),
    // the date this delivery is for

    status: deliveryStatusEnum('status')
      .default('pending')
      .notNull(),

    delivery_notes: varchar('delivery_notes', { length: 500 }),
    // user instructions — e.g. "Leave at door", "Call before delivery"

    failed_reason: varchar('failed_reason', { length: 500 }),
    // filled when status = failed — e.g. "User not available", "Wrong address"

    // ── Timestamps for each status transition ─────────────────────────────
    assigned_at:    timestamp('assigned_at',    { mode: 'date' }),
    picked_up_at:   timestamp('picked_up_at',   { mode: 'date' }),
    delivered_at:   timestamp('delivered_at',   { mode: 'date' }),
    cancelled_at:   timestamp('cancelled_at',   { mode: 'date' }),

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('order_user_idx').on(table.user_id),
    index('order_agent_idx').on(table.agent_id),
    index('order_status_idx').on(table.status),
    index('order_delivery_date_idx').on(table.delivery_date),
    index('order_daily_menu_idx').on(table.daily_menu_id),
    index('order_location_idx').on(table.location_id),
    index('order_subscription_idx').on(table.subscription_id),

    // Composite — agent dashboard: all active orders for an agent today
    // WHERE agent_id = ? AND delivery_date = ? AND status NOT IN (delivered, cancelled)
    index('order_agent_date_status_idx').on(
      table.agent_id,
      table.delivery_date,
      table.status,
    ),

    // Composite — user tracks their order for today
    // WHERE user_id = ? AND delivery_date = ? AND slot = ?
    index('order_user_date_slot_idx').on(
      table.user_id,
      table.delivery_date,
      table.slot,
    ),

    // Composite — admin: all pending orders for a date
    // WHERE status = 'pending' AND delivery_date = ?
    index('order_status_date_idx').on(
      table.status,
      table.delivery_date,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const deliveryOrderRelations = relations(DeliveryOrder, ({ one, many }) => ({
  user: one(User, {
    fields:     [DeliveryOrder.user_id],
    references: [User.id],
  }),
  subscription: one(Subscription, {
    fields:     [DeliveryOrder.subscription_id],
    references: [Subscription.id],
  }),
  agent: one(DeliveryAgent, {
    fields:     [DeliveryOrder.agent_id],
    references: [DeliveryAgent.id],
  }),
  location: one(DeliveryLocation, {
    fields:     [DeliveryOrder.location_id],
    references: [DeliveryLocation.id],
  }),
  dailyMenu: one(DailyMenu, {
    fields:     [DeliveryOrder.daily_menu_id],
    references: [DailyMenu.id],
  }),
  trackingLogs: many(DeliveryTrackingLog),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryOrderRow    = typeof DeliveryOrder.$inferSelect;
export type DeliveryOrderInsert = typeof DeliveryOrder.$inferInsert;