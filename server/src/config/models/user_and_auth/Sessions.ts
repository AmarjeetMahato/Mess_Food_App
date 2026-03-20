import { relations } from 'drizzle-orm';
import {pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
  uniqueIndex,
  inet,
} from 'drizzle-orm/pg-core';
import { User } from './User';
import { Device } from './Device';


export const Session = pgTable(
  'sessions',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),
 
    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),
 
    device_id: uuid('device_id')
      .references(() => Device.id, { onDelete: 'set null' }),
    // null means browser session with no device token
 
    refresh_token_hash: varchar('refresh_token_hash', { length: 255 })
      .notNull(),
    // SHA-256 hash of the raw refresh JWT — never store raw token
 
    access_token_jti: varchar('access_token_jti', { length: 255 })
      .notNull(),
    // JWT ID from the access token — used to identify & revoke current session
 
    ip_address: inet('ip_address'),
    // postgres inet type handles both IPv4 and IPv6
 
    user_agent: varchar('user_agent', { length: 512 }),
 
    is_active: boolean('is_active')
      .default(true)
      .notNull(),
 
    expires_at: timestamp('expires_at', { mode: 'date' })
      .notNull(),
    // refresh token expiry — 30 days from creation
 
    last_used_at: timestamp('last_used_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
 
    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex('session_refresh_token_hash_udx').on(table.refresh_token_hash),
    index('session_user_id_idx').on(table.user_id),
    index('session_device_id_idx').on(table.device_id),
    index('session_is_active_idx').on(table.is_active),
    index('session_expires_at_idx').on(table.expires_at),
    index('session_jti_idx').on(table.access_token_jti),
    index('session_user_active_idx').on(table.user_id, table.is_active),
    // composite index — most common query: active sessions for a user
  ],
);
 

// ─── Relations ────────────────────────────────────────────────────────────────
 
export const sessionRelations = relations(Session, ({ one }) => ({
  user:   one(User,   { fields: [Session.user_id],   references: [User.id] }),
  device: one(Device, { fields: [Session.device_id], references: [Device.id] }),
}));


// ─── Drizzle inferred types ───────────────────────────────────────────────────
 
export type SessionRow    = typeof Session.$inferSelect;
export type SessionInsert = typeof Session.$inferInsert;
 