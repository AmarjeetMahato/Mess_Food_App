import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, integer,
  boolean, timestamp, index,
} from 'drizzle-orm/pg-core';
import { mealSlotEnum } from './daily-menu';
import { MenuItem } from './menu-item';
import { User } from '../user_and_auth';

// ─── Table ────────────────────────────────────────────────────────────────────
// Default rotating 3-day plan template
// Used by admin to auto-generate daily_menu entries
// e.g. Day 1 Breakfast = [Idli, Sambar] → auto-populate every Monday

export const MealPlanTemplate = pgTable(
  'meal_plan_templates',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    day_number: integer('day_number')
      .notNull(),
    // 1 | 2 | 3 — the rotating day in the plan cycle

    slot: mealSlotEnum('slot')
      .notNull(),
    // breakfast | lunch | snacks | dinner — reusing enum from daily-menu

    menu_item_id: uuid('menu_item_id')
      .references(() => MenuItem.id, { onDelete: 'restrict' })
      .notNull(),
    // which item is part of this template slot

    is_active: boolean('is_active')
      .default(true)
      .notNull(),
    // deactivate a template entry without deleting it

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
    index('template_day_number_idx').on(table.day_number),
    index('template_slot_idx').on(table.slot),
    index('template_is_active_idx').on(table.is_active),
    index('template_menu_item_idx').on(table.menu_item_id),

    // Composite — most common query: fetch full template for a day + slot
    // WHERE day_number = ? AND slot = ? AND is_active = true
    index('template_day_slot_active_idx').on(
      table.day_number,
      table.slot,
      table.is_active,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const mealPlanTemplateRelations = relations(MealPlanTemplate, ({ one }) => ({
    createdBy:        one(User, {
      fields:     [MealPlanTemplate.created_by],
      references: [User.id],
    }),
  menuItem: one(MenuItem, {
    fields:     [MealPlanTemplate.menu_item_id],
    references: [MenuItem.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type MealPlanTemplateRow    = typeof MealPlanTemplate.$inferSelect;
export type MealPlanTemplateInsert = typeof MealPlanTemplate.$inferInsert;