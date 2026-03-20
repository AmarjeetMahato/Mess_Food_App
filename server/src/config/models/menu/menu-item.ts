import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar,
  text, boolean, timestamp,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { MenuItemMapping } from './menu_item_mapping';
import { MealPlanTemplate } from './meal-plan-template';
import { Feedback } from './feedback';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const foodCategoryEnum = pgEnum('food_category', [
  'veg',
  'non_veg',
  'egg',
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const MenuItem = pgTable(
  'menu_items',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    name: varchar('name', { length: 255 })
      .notNull(),
    // e.g. "Idli", "Chicken Curry", "Boiled Egg"

    description: text('description'),
    // optional — short description of the item

    category: foodCategoryEnum('category')
      .notNull(),
    // veg | non_veg | egg

    image_url: varchar('image_url', { length: 500 }),
    // uploaded via /upload/menu-image endpoint

    is_available: boolean('is_available')
      .default(true)
      .notNull(),
    // admin can mark item unavailable without deleting it

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('menu_item_name_idx').on(table.name),
    index('menu_item_category_idx').on(table.category),
    index('menu_item_is_available_idx').on(table.is_available),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const menuItemRelations = relations(MenuItem, ({ many }) => ({
  menuItemMappings:  many(MenuItemMapping),
  mealPlanTemplates: many(MealPlanTemplate),
  feedbacks:         many(Feedback),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type MenuItemRow    = typeof MenuItem.$inferSelect;
export type MenuItemInsert = typeof MenuItem.$inferInsert;