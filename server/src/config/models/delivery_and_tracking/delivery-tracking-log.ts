import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, numeric,
  timestamp, index,
} from 'drizzle-orm/pg-core';
import { DeliveryOrder, deliveryStatusEnum } from './delivery-order';
import { DeliveryAgent } from './delivery-agent';

// ─── Table ────────────────────────────────────────────────────────────────────
// Append-only historical log of agent positions per delivery order
// Written every 5-10 seconds while order is active
// Used for: route replay, dispute resolution, delivery time analysis
// Never updated — only inserted

export const DeliveryTrackingLog = pgTable(
  'delivery_tracking_logs',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    delivery_order_id: uuid('delivery_order_id')
      .references(() => DeliveryOrder.id, { onDelete: 'cascade' })
      .notNull(),
    // which delivery this log entry belongs to

    agent_id: uuid('agent_id')
      .references(() => DeliveryAgent.id, { onDelete: 'cascade' })
      .notNull(),
    // denormalized for fast agent-level queries without joining delivery_orders

    lat: numeric('lat', { precision: 10, scale: 7 })
      .notNull(),

    lng: numeric('lng', { precision: 10, scale: 7 })
      .notNull(),

    heading: numeric('heading', { precision: 5, scale: 2 }),
    // direction in degrees at this log point

    speed: numeric('speed', { precision: 5, scale: 2 }),
    // speed in km/h at this log point

    status_snapshot: deliveryStatusEnum('status_snapshot')
      .notNull(),
    // order status at the time this location was logged
    // allows route replay to show when status changed during the journey

    logged_at: timestamp('logged_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    // exact timestamp of this location ping
  },
  (table) => [
    index('tracking_log_order_idx').on(table.delivery_order_id),
    index('tracking_log_agent_idx').on(table.agent_id),
    index('tracking_log_logged_at_idx').on(table.logged_at),

    // Composite — fetch full route for a delivery in chronological order
    // WHERE delivery_order_id = ? ORDER BY logged_at ASC
    index('tracking_log_order_logged_at_idx').on(
      table.delivery_order_id,
      table.logged_at,
    ),

    // Composite — agent history across all deliveries
    // WHERE agent_id = ? AND logged_at BETWEEN ? AND ?
    index('tracking_log_agent_logged_at_idx').on(
      table.agent_id,
      table.logged_at,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const deliveryTrackingLogRelations = relations(DeliveryTrackingLog, ({ one }) => ({
  deliveryOrder: one(DeliveryOrder, {
    fields:     [DeliveryTrackingLog.delivery_order_id],
    references: [DeliveryOrder.id],
  }),
  agent: one(DeliveryAgent, {
    fields:     [DeliveryTrackingLog.agent_id],
    references: [DeliveryAgent.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryTrackingLogRow    = typeof DeliveryTrackingLog.$inferSelect;
export type DeliveryTrackingLogInsert = typeof DeliveryTrackingLog.$inferInsert;