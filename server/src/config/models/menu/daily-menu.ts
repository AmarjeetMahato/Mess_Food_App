import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, date,
  boolean, timestamp,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { MenuItemMapping } from './menu_item_mapping';
import { Feedback } from './feedback';
import { User } from '../user_and_auth/User';


// ─── Enums ────────────────────────────────────────────────────────────────────

export const mealSlotEnum = pgEnum('meal_slot', [
  'breakfast',
  'lunch',
  'snacks',
  'dinner',
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const DailyMenu = pgTable(
  'daily_menu',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    menu_date: date('menu_date', { mode: 'date' })
      .notNull(),
    // the specific date this menu is for

    slot: mealSlotEnum('slot')
      .notNull(),
    // breakfast | lunch | snacks | dinner

    is_active: boolean('is_active')
      .default(true)
      .notNull(),
    // admin can deactivate a slot (e.g. no dinner on Sunday)

    created_by: uuid('created_by')
      .references(() => User.id, { onDelete: 'set null' }),
    // which admin created this daily menu entry

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('daily_menu_date_idx').on(table.menu_date),
    index('daily_menu_slot_idx').on(table.slot),
    index('daily_menu_is_active_idx').on(table.is_active),

    // Composite — most common query: fetch menu for a date range (3-day view)
    // WHERE menu_date BETWEEN ? AND ? AND is_active = true
    index('daily_menu_date_slot_idx').on(
      table.menu_date,
      table.slot,
      table.is_active,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const dailyMenuRelations = relations(DailyMenu, ({ one, many }) => ({
  createdBy:        one(User, {
    fields:     [DailyMenu.created_by],
    references: [User.id],
  }),
  menuItemMappings: many(MenuItemMapping),
  feedbacks:        many(Feedback),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type DailyMenuRow    = typeof DailyMenu.$inferSelect;
export type DailyMenuInsert = typeof DailyMenu.$inferInsert;