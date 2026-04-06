import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, numeric,
  boolean, timestamp, date,
  index,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';
import { Subscription } from './subscription';
import { DailyMenu, mealSlotEnum } from '../menu/daily-menu';

// ─── Table ────────────────────────────────────────────────────────────────────

export const MealSkip = pgTable(
  'meal_skips',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),

    subscription_id: uuid('subscription_id')
      .references(() => Subscription.id, { onDelete: 'cascade' })
      .notNull(),
    // which active subscription this skip is against

    daily_menu_id: uuid('daily_menu_id')
      .references(() => DailyMenu.id, { onDelete: 'restrict' })
      .notNull(),
    // which specific daily menu entry is being skipped

    slot: mealSlotEnum('slot')
      .notNull(),
    // reusing enum — breakfast | lunch | snacks | dinner

    skip_date: date('skip_date', { mode: 'date' })
      .notNull(),
    // the date of the meal being skipped

    reason: varchar('reason', { length: 500 }),
    // optional — e.g. "Going out for lunch"

    wallet_credit_amount: numeric('wallet_credit_amount', { precision: 10, scale: 2 })
      .default('0')
      .notNull(),
    // amount credited back to wallet for this skip
    // 0 if no refund policy, or calculated based on meal price

    is_wallet_credited: boolean('is_wallet_credited')
      .default(false)
      .notNull(),
    // explicit flag — avoids double crediting on retry scenarios

    created_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),

    updated_at: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),

  },
  (table) => [
    index('skip_user_idx').on(table.user_id),
    index('skip_subscription_idx').on(table.subscription_id),
    index('skip_daily_menu_idx').on(table.daily_menu_id),
    index('skip_date_idx').on(table.skip_date),
    index('skip_slot_idx').on(table.slot),
    index('skip_is_wallet_credited_idx').on(table.is_wallet_credited),

    // Composite — check if user already skipped this slot on this date
    // WHERE user_id = ? AND skip_date = ? AND slot = ?
    index('skip_user_date_slot_idx').on(
      table.user_id,
      table.skip_date,
      table.slot,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const mealSkipRelations = relations(MealSkip, ({ one }) => ({
  user: one(User, {
    fields:     [MealSkip.user_id],
    references: [User.id],
  }),
  subscription: one(Subscription, {
    fields:     [MealSkip.subscription_id],
    references: [Subscription.id],
  }),
  dailyMenu: one(DailyMenu, {
    fields:     [MealSkip.daily_menu_id],
    references: [DailyMenu.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type MealSkipRow    = typeof MealSkip.$inferSelect;
export type MealSkipInsert = typeof MealSkip.$inferInsert;