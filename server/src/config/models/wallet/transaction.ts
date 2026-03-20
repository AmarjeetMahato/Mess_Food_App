import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, numeric,
  timestamp, index, pgEnum,
} from 'drizzle-orm/pg-core';
import { Wallet } from './wallet';
import { User } from '../user_and_auth/User';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const transactionTypeEnum = pgEnum('transaction_type', [
  'credit',  // money added to wallet
  'debit',   // money deducted from wallet
]);

export const transactionCategoryEnum = pgEnum('transaction_category', [
  'recharge',          // wallet topped up
  'meal_deduction',    // daily meal charge deducted
  'skip_refund',       // meal skipped — amount refunded to wallet
  'admin_adjustment',  // manual correction by admin (positive or negative)
  'refund',            // refund from failed delivery / cancelled order
  'subscription_purchase', // subscription plan bought from wallet
]);

export const transactionReferenceTypeEnum = pgEnum('transaction_reference_type', [
  'recharge',
  'delivery_order',
  'meal_skip',
  'subscription',
  'admin',
]);

// ─── Table ────────────────────────────────────────────────────────────────────
// Append-only ledger — never update or delete a transaction row
// Every balance change must have a corresponding transaction entry

export const Transaction = pgTable(
  'transactions',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    wallet_id: uuid('wallet_id')
      .references(() => Wallet.id, { onDelete: 'cascade' })
      .notNull(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),
    // denormalized — fast user-level transaction history without joining wallets

    type: transactionTypeEnum('type')
      .notNull(),
    // credit | debit

    category: transactionCategoryEnum('category')
      .notNull(),
    // what caused this transaction

    amount: numeric('amount', { precision: 10, scale: 2 })
      .notNull(),
    // always positive — type field tells you if it is credit or debit

    balance_before: numeric('balance_before', { precision: 10, scale: 2 })
      .notNull(),
    // wallet balance before this transaction
    // critical for audit — proves no transaction was missed

    balance_after: numeric('balance_after', { precision: 10, scale: 2 })
      .notNull(),
    // wallet balance after this transaction
    // balance_after = balance_before + amount (credit)
    // balance_after = balance_before - amount (debit)

    reference_id: uuid('reference_id'),
    // optional — links to the entity that caused this transaction
    // no FK — flexible across multiple tables

    reference_type: transactionReferenceTypeEnum('reference_type'),
    // tells you which table reference_id points to

    description: varchar('description', { length: 500 }),
    // human readable — e.g. "Lunch deducted for 20 Mar 2026"
    // e.g. "Wallet recharged via Razorpay"
    // e.g. "Skip refund for breakfast on 21 Mar 2026"

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    // append-only — no updated_at needed
  },
  (table) => [
    index('transaction_wallet_idx').on(table.wallet_id),
    index('transaction_user_idx').on(table.user_id),
    index('transaction_type_idx').on(table.type),
    index('transaction_category_idx').on(table.category),
    index('transaction_reference_idx').on(table.reference_id),
    index('transaction_created_at_idx').on(table.created_at),

    // Composite — user transaction history sorted by date
    // WHERE user_id = ? ORDER BY created_at DESC
    index('transaction_user_created_at_idx').on(
      table.user_id,
      table.created_at,
    ),

    // Composite — wallet ledger in order
    // WHERE wallet_id = ? ORDER BY created_at ASC
    index('transaction_wallet_created_at_idx').on(
      table.wallet_id,
      table.created_at,
    ),

    // Composite — admin: all deductions for a specific category
    // WHERE category = ? AND type = 'debit'
    index('transaction_category_type_idx').on(
      table.category,
      table.type,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const transactionRelations = relations(Transaction, ({ one }) => ({
  wallet: one(Wallet, {
    fields:     [Transaction.wallet_id],
    references: [Wallet.id],
  }),
  user: one(User, {
    fields:     [Transaction.user_id],
    references: [User.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type TransactionRow    = typeof Transaction.$inferSelect;
export type TransactionInsert = typeof Transaction.$inferInsert;