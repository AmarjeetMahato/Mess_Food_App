import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, numeric,
  boolean, timestamp, index,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';
import { Recharge } from './recharge';
import { Transaction } from './transaction';

// ─── Table ────────────────────────────────────────────────────────────────────

export const Wallet = pgTable(
  'wallets',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    // unique — one user has exactly one wallet

    balance: numeric('balance', { precision: 10, scale: 2 })
      .default('0.00')
      .notNull(),
    // current available balance
    // always use numeric for money — never float

    total_recharged: numeric('total_recharged', { precision: 12, scale: 2 })
      .default('0.00')
      .notNull(),
    // lifetime total amount recharged into wallet
    // used for analytics + reporting

    total_spent: numeric('total_spent', { precision: 12, scale: 2 })
      .default('0.00')
      .notNull(),
    // lifetime total amount spent from wallet
    // used for analytics + reporting

    is_active: boolean('is_active')
      .default(true)
      .notNull(),
    // false = wallet frozen by admin (e.g. fraud detection)

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('wallet_user_idx').on(table.user_id),
    index('wallet_is_active_idx').on(table.is_active),
    index('wallet_balance_idx').on(table.balance),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const walletRelations = relations(Wallet, ({ one, many }) => ({
  user: one(User, {
    fields:     [Wallet.user_id],
    references: [User.id],
  }),
  recharges:    many(Recharge),
  transactions: many(Transaction),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletRow    = typeof Wallet.$inferSelect;
export type WalletInsert = typeof Wallet.$inferInsert;