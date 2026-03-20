import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, integer,
  text, timestamp, index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { User } from '../user_and_auth/User';
import { DailyMenu } from './daily-menu';
import { MenuItem } from './menu-item';

// ─── Table ────────────────────────────────────────────────────────────────────

export const Feedback = pgTable(
  'feedback',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),
    // who gave the feedback

    daily_menu_id: uuid('daily_menu_id')
      .references(() => DailyMenu.id, { onDelete: 'cascade' })
      .notNull(),
    // which day + slot the feedback is for

    menu_item_id: uuid('menu_item_id')
      .references(() => MenuItem.id, { onDelete: 'cascade' })
      .notNull(),
    // which specific item the feedback is for

    rating: integer('rating')
      .notNull(),
    // 1 to 5 — enforced by check constraint below

    comment: text('comment'),
    // optional written feedback from user

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('feedback_user_idx').on(table.user_id),
    index('feedback_daily_menu_idx').on(table.daily_menu_id),
    index('feedback_menu_item_idx').on(table.menu_item_id),
    index('feedback_rating_idx').on(table.rating),

    // Composite — prevent duplicate feedback from same user for same item on same day
    // one user can only rate one item once per daily_menu slot
    index('feedback_user_daily_menu_item_idx').on(
      table.user_id,
      table.daily_menu_id,
      table.menu_item_id,
    ),

    // DB-level constraint — rating must be between 1 and 5
    check('feedback_rating_range', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const feedbackRelations = relations(Feedback, ({ one }) => ({
  user: one(User, {
    fields:     [Feedback.user_id],
    references: [User.id],
  }),
  dailyMenu: one(DailyMenu, {
    fields:     [Feedback.daily_menu_id],
    references: [DailyMenu.id],
  }),
  menuItem: one(MenuItem, {
    fields:     [Feedback.menu_item_id],
    references: [MenuItem.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedbackRow    = typeof Feedback.$inferSelect;
export type FeedbackInsert = typeof Feedback.$inferInsert;