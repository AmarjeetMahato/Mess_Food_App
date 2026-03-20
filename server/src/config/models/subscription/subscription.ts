import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, integer,
  boolean, timestamp, date,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';
import { MealSkip } from './meal-skip';
import { MealAttendance } from './meal-attendance';
import { SubscriptionPause } from './subscription-pause';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const planTypeEnum = pgEnum('plan_type', [
  'daily',
  'weekly',
  'monthly',
]);

export const subscriptionStatusEnum = pgEnum('subscription_status', [
  'active',
  'paused',
  'expired',
  'cancelled',
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const Subscription = pgTable(
  'subscriptions',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),

    plan_type: planTypeEnum('plan_type')
      .notNull(),
    // daily | weekly | monthly

    status: subscriptionStatusEnum('status')
      .default('active')
      .notNull(),
    // active | paused | expired | cancelled

    start_date: date('start_date', { mode: 'date' })
      .notNull(),

    end_date: date('end_date', { mode: 'date' })
      .notNull(),
    // extended automatically when subscription is paused

    total_days: integer('total_days')
      .notNull(),
    // total days purchased — e.g. 30 for monthly

    consumed_days: integer('consumed_days')
      .default(0)
      .notNull(),
    // incremented each day user actually consumes a meal

    remaining_days: integer('remaining_days')
      .notNull(),
    // stored column — updated on every consumption, skip, pause
    // faster for queries like "show remaining days" without computing

    // ── Meal slot flags ────────────────────────────────────────────────────
    // user subscribes to specific slots only
    // e.g. breakfast + dinner only, no lunch
    has_breakfast: boolean('has_breakfast')
      .default(false)
      .notNull(),

    has_lunch: boolean('has_lunch')
      .default(false)
      .notNull(),

    has_dinner: boolean('has_dinner')
      .default(false)
      .notNull(),

    has_snacks: boolean('has_snacks')
      .default(false)
      .notNull(),

    auto_renew: boolean('auto_renew')
      .default(false)
      .notNull(),
    // if true — auto create new subscription when this one expires

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('subscription_user_idx').on(table.user_id),
    index('subscription_status_idx').on(table.status),
    index('subscription_plan_type_idx').on(table.plan_type),
    index('subscription_end_date_idx').on(table.end_date),

    // Composite — most common query: fetch active subscription for a user
    // WHERE user_id = ? AND status = 'active'
    index('subscription_user_status_idx').on(
      table.user_id,
      table.status,
    ),

    // Composite — find subscriptions expiring soon (for notifications)
    // WHERE status = 'active' AND end_date <= ?
    index('subscription_status_end_date_idx').on(
      table.status,
      table.end_date,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const subscriptionRelations = relations(Subscription, ({ one, many }) => ({
  user:               one(User, {
    fields:     [Subscription.user_id],
    references: [User.id],
  }),
  pauses:       many(SubscriptionPause),
  mealSkips:    many(MealSkip),
  attendances:  many(MealAttendance),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionRow    = typeof Subscription.$inferSelect;
export type SubscriptionInsert = typeof Subscription.$inferInsert;