import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
  pgEnum,
  text,
} from 'drizzle-orm/pg-core';
import { User } from './User';

// ─── Enums ────────────────────────────────────────────────────────────────────
 
export const oauthProviderEnum = pgEnum('oauth_provider', [
  'google',
  'facebook',
  'apple',
]);
 
// ─── Drizzle Table Definition ─────────────────────────────────────────────────
 
export const OauthAccount = pgTable(
  'oauth_accounts',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),
 
    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),
 
    provider: oauthProviderEnum('provider')
      .notNull(),
    // 'google' | 'facebook' | 'apple'
 
    provider_id: varchar('provider_id', { length: 255 })
      .notNull(),
    // Unique user ID from the OAuth provider (e.g. Google sub)
 
    provider_email: varchar('provider_email', { length: 255 }),
    // Email returned by the provider — may differ from user.email
 
    access_token: text('access_token'),
    // Encrypted at application level before storing
 
    refresh_token: text('refresh_token'),
    // Encrypted at application level before storing
 
    token_expires_at: timestamp('token_expires_at', { mode: 'date' }),
    // When the provider access token expires
 
    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
 
    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // One provider account per provider per user
    uniqueIndex('oauth_provider_provider_id_udx').on(table.provider, table.provider_id),
    index('oauth_user_id_idx').on(table.user_id),
    index('oauth_provider_idx').on(table.provider),
    index('oauth_provider_email_idx').on(table.provider_email),
  ],
);
 
// ─── Relations ────────────────────────────────────────────────────────────────
 
export const oauthAccountRelations = relations(OauthAccount, ({ one }) => ({
  user: one(User, { fields: [OauthAccount.user_id], references: [User.id] }),
}));
 
// ─── Drizzle inferred types ───────────────────────────────────────────────────
 
export type OauthAccountRow    = typeof OauthAccount.$inferSelect;
export type OauthAccountInsert = typeof OauthAccount.$inferInsert;
 