
import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ─── Drizzle Table Definition ───────────────────────────────────────────────
 
export const Role = pgTable(
  'roles',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),
 
    name: varchar('name', { length: 50 })
      .notNull(),
    // Seeded values: 'admin' | 'user' | 'driver'
 
    description: varchar('description', { length: 255 }),
 
    is_active: boolean('is_active')
      .default(true)
      .notNull(),
 
    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
 
    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('role_name_udx').on(table.name),
    index('role_is_active_idx').on(table.is_active),
  ],
);



// ─── Relations ───────────────────────────────────────────────────────────────
// Defined after User model is available — imported in index.ts
 
export const roleRelations = relations(Role, ({ many }) => ({
  // circular ref resolved via barrel index
  users: many(Role), // placeholder — overridden in index.ts if needed
}));
 
// ─── Drizzle inferred types ──────────────────────────────────────────────────
 
export type RoleRow    = typeof Role.$inferSelect;
export type RoleInsert = typeof Role.$inferInsert;
 