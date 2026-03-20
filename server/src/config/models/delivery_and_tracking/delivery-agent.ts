import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, numeric,
  boolean, timestamp, integer,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { AgentLiveLocation } from './agent-live-location';
import { DeliveryTrackingLog } from './delivery-tracking-log';
import { DeliveryOrder } from './delivery-order';
import {User} from "../user_and_auth/User"
// ─── Enums ────────────────────────────────────────────────────────────────────

export const vehicleTypeEnum = pgEnum('vehicle_type', [
  'bike',
  'scooter',
  'cycle',
  'walking',
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const DeliveryAgent = pgTable(
  'delivery_agents',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    // agent is also a user with driver role
    // unique — one user can only be one agent

    vehicle_type: vehicleTypeEnum('vehicle_type')
      .notNull(),

    vehicle_number: varchar('vehicle_number', { length: 50 }),
    // e.g. "MH12AB1234" — null for cycle/walking

    current_zone: varchar('current_zone', { length: 255 }),
    // e.g. "Block A", "Hostel Zone" — admin assigned delivery zone

    rating: numeric('rating', { precision: 3, scale: 2 })
      .default('0.00')
      .notNull(),
    // running average rating — updated after each delivery
    // stored for fast queries — range: 0.00 to 5.00

    total_deliveries: integer('total_deliveries')
      .default(0)
      .notNull(),
    // incremented on every successful delivery

    is_available: boolean('is_available')
      .default(false)
      .notNull(),
    // true = agent is online and ready to accept deliveries

    is_active: boolean('is_active')
      .default(true)
      .notNull(),
    // false = agent account suspended by admin

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('agent_user_idx').on(table.user_id),
    index('agent_is_available_idx').on(table.is_available),
    index('agent_is_active_idx').on(table.is_active),
    index('agent_current_zone_idx').on(table.current_zone),
    index('agent_vehicle_type_idx').on(table.vehicle_type),

    // Composite — find available active agents in a zone
    // WHERE current_zone = ? AND is_available = true AND is_active = true
    index('agent_zone_available_active_idx').on(
      table.current_zone,
      table.is_available,
      table.is_active,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const deliveryAgentRelations = relations(DeliveryAgent, ({ one, many }) => ({
  user: one(User, {
    fields:     [DeliveryAgent.user_id],
    references: [User.id],
  }),
  deliveryOrders: many(DeliveryOrder),
  liveLocation:   one(AgentLiveLocation),
  trackingLogs:   many(DeliveryTrackingLog),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type DeliveryAgentRow    = typeof DeliveryAgent.$inferSelect;
export type DeliveryAgentInsert = typeof DeliveryAgent.$inferInsert;