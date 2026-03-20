import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, numeric,
  timestamp, index, pgEnum,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';
import { Wallet } from './wallet';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const paymentMethodEnum = pgEnum('payment_method', [
  'upi',
  'card',
  'netbanking',
  'cash',       // admin manually tops up wallet
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',   // payment initiated, awaiting confirmation
  'success',   // payment confirmed, wallet credited
  'failed',    // payment failed at gateway
  'refunded',  // amount refunded back to original payment method
]);

export const paymentGatewayEnum = pgEnum('payment_gateway', [
  'razorpay',
  'stripe',
  'manual',    // cash recharge done by admin
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const Recharge = pgTable(
  'recharges',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),
    // denormalized for fast user-level recharge history queries

    wallet_id: uuid('wallet_id')
      .references(() => Wallet.id, { onDelete: 'cascade' })
      .notNull(),

    amount: numeric('amount', { precision: 10, scale: 2 })
      .notNull(),
    // amount recharged in INR

    payment_method: paymentMethodEnum('payment_method')
      .notNull(),

    payment_status: paymentStatusEnum('payment_status')
      .default('pending')
      .notNull(),

    gateway: paymentGatewayEnum('gateway')
      .notNull(),

    transaction_ref: varchar('transaction_ref', { length: 255 }),
    // payment gateway reference id
    // e.g. Razorpay order_id or payment_id
    // null for manual/cash recharges

    notes: varchar('notes', { length: 500 }),
    // optional — admin note for manual recharges
    // e.g. "Cash collected at front desk"

    recharged_at: timestamp('recharged_at', { mode: 'date' }),
    // when payment was confirmed and wallet credited
    // null = not yet confirmed (pending)

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('recharge_user_idx').on(table.user_id),
    index('recharge_wallet_idx').on(table.wallet_id),
    index('recharge_payment_status_idx').on(table.payment_status),
    index('recharge_gateway_idx').on(table.gateway),
    index('recharge_transaction_ref_idx').on(table.transaction_ref),
    index('recharge_created_at_idx').on(table.created_at),

    // Composite — user recharge history
    // WHERE user_id = ? ORDER BY created_at DESC
    index('recharge_user_created_at_idx').on(
      table.user_id,
      table.created_at,
    ),

    // Composite — find pending recharges to verify with gateway
    // WHERE payment_status = 'pending' AND gateway = ?
    index('recharge_status_gateway_idx').on(
      table.payment_status,
      table.gateway,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const rechargeRelations = relations(Recharge, ({ one }) => ({
  user: one(User, {
    fields:     [Recharge.user_id],
    references: [User.id],
  }),
  wallet: one(Wallet, {
    fields:     [Recharge.wallet_id],
    references: [Wallet.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type RechargeRow    = typeof Recharge.$inferSelect;
export type RechargeInsert = typeof Recharge.$inferInsert;