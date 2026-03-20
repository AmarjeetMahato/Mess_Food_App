import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, numeric,
  boolean, timestamp, index,
} from 'drizzle-orm/pg-core';
import { DeliveryAgent } from './delivery-agent';

// ─── Table ────────────────────────────────────────────────────────────────────
// One-to-one with delivery_agents
// Updated every 5-10 seconds via socket.io while agent is on duty
// This is NOT a log — it is only the CURRENT position
// Historical positions go into delivery_tracking_log

export const AgentLiveLocation = pgTable(
  'agent_live_locations',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    agent_id: uuid('agent_id')
      .references(() => DeliveryAgent.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    // unique — one agent has exactly one live location row
    // upserted on every location update, never inserted twice

    lat: numeric('lat', { precision: 10, scale: 7 })
      .notNull(),
    // current GPS latitude

    lng: numeric('lng', { precision: 10, scale: 7 })
      .notNull(),
    // current GPS longitude

    heading: numeric('heading', { precision: 5, scale: 2 }),
    // direction agent is moving in degrees (0-360)
    // 0 = North, 90 = East, 180 = South, 270 = West
    // null if stationary

    speed: numeric('speed', { precision: 5, scale: 2 }),
    // current speed in km/h — null if stationary

    is_on_duty: boolean('is_on_duty')
      .default(false)
      .notNull(),
    // true = agent is actively on a delivery run
    // false = agent is online but not on active delivery

    last_updated_at: timestamp('last_updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    // updated on every location ping from agent app
    // used to detect stale location (agent went offline without logging out)
  },
  (table) => [
    index('live_location_agent_idx').on(table.agent_id),
    index('live_location_is_on_duty_idx').on(table.is_on_duty),
    index('live_location_last_updated_idx').on(table.last_updated_at),

    // Composite — admin map: all agents currently on duty
    // WHERE is_on_duty = true
    index('live_location_on_duty_updated_idx').on(
      table.is_on_duty,
      table.last_updated_at,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const agentLiveLocationRelations = relations(AgentLiveLocation, ({ one }) => ({
  agent: one(DeliveryAgent, {
    fields:     [AgentLiveLocation.agent_id],
    references: [DeliveryAgent.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type AgentLiveLocationRow    = typeof AgentLiveLocation.$inferSelect;
export type AgentLiveLocationInsert = typeof AgentLiveLocation.$inferInsert;