import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar,
  boolean, timestamp, date,
  index,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';
import { Subscription } from './subscription';

// ─── Table ────────────────────────────────────────────────────────────────────

export const SubscriptionPause = pgTable(
  'subscription_pauses',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    subscription_id: uuid('subscription_id')
      .references(() => Subscription.id, { onDelete: 'cascade' })
      .notNull(),
    // which subscription is paused

    paused_by: uuid('paused_by')
      .references(() => User.id, { onDelete: 'set null' }),
    // user who triggered the pause — could be the subscriber or an admin

    pause_start: date('pause_start', { mode: 'date' })
      .notNull(),
    // date from which pause begins (inclusive)

    pause_end: date('pause_end', { mode: 'date' }),
    // date on which pause ends (inclusive)
    // null = still paused — not yet resumed

    reason: varchar('reason', { length: 500 }),
    // optional reason for pausing — e.g. "Going home for vacation"

    is_resumed: boolean('is_resumed')
      .default(false)
      .notNull(),
    // explicit flag — faster than checking pause_end for null

    resumed_at: timestamp('resumed_at', { mode: 'date' }),
    // exact timestamp when user hit resume
    // pause_end is the date, resumed_at is the precise moment

    days_paused: varchar('days_paused', { length: 10 }),
    // computed and stored when resume happens
    // e.g. "5" — used to extend subscription end_date by same amount

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('pause_subscription_idx').on(table.subscription_id),
    index('pause_paused_by_idx').on(table.paused_by),
    index('pause_is_resumed_idx').on(table.is_resumed),
    index('pause_start_idx').on(table.pause_start),

    // Composite — find active pause for a subscription
    // WHERE subscription_id = ? AND is_resumed = false
    index('pause_subscription_resumed_idx').on(
      table.subscription_id,
      table.is_resumed,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const subscriptionPauseRelations = relations(SubscriptionPause, ({ one }) => ({
  subscription: one(Subscription, {
    fields:     [SubscriptionPause.subscription_id],
    references: [Subscription.id],
  }),
  pausedBy: one(User, {
    fields:     [SubscriptionPause.paused_by],
    references: [User.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionPauseRow    = typeof SubscriptionPause.$inferSelect;
export type SubscriptionPauseInsert = typeof SubscriptionPause.$inferInsert;