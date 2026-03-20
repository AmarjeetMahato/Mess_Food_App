import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar,
  timestamp, index,
} from 'drizzle-orm/pg-core';
import { DailyMenu } from './daily-menu';
import { MenuItem } from './menu-item';

// ─── Table ────────────────────────────────────────────────────────────────────
// Junction table — one daily_menu slot has many menu_items
// e.g. breakfast on 20-March = [Idli, Sambar, Chutney, Tea]

export const MenuItemMapping = pgTable(
  'menu_item_mappings',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    daily_menu_id: uuid('daily_menu_id')
      .references(() => DailyMenu.id, { onDelete: 'cascade' })
      .notNull(),
    // which daily menu slot this item belongs to

    menu_item_id: uuid('menu_item_id')
      .references(() => MenuItem.id, { onDelete: 'restrict' })
      .notNull(),
    // which food item is being served
    // restrict — cant delete a menu_item that is actively mapped

    quantity_description: varchar('quantity_description', { length: 100 }),
    // optional — e.g. "2 pieces", "1 bowl", "unlimited"

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('mapping_daily_menu_idx').on(table.daily_menu_id),
    index('mapping_menu_item_idx').on(table.menu_item_id),

    // Composite — fetch all items for a specific daily menu slot
    // WHERE daily_menu_id = ?
    index('mapping_daily_menu_item_idx').on(
      table.daily_menu_id,
      table.menu_item_id,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const menuItemMappingRelations = relations(MenuItemMapping, ({ one }) => ({
  dailyMenu: one(DailyMenu, {
    fields:     [MenuItemMapping.daily_menu_id],
    references: [DailyMenu.id],
  }),
  menuItem: one(MenuItem, {
    fields:     [MenuItemMapping.menu_item_id],
    references: [MenuItem.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type MenuItemMappingRow    = typeof MenuItemMapping.$inferSelect;
export type MenuItemMappingInsert = typeof MenuItemMapping.$inferInsert;