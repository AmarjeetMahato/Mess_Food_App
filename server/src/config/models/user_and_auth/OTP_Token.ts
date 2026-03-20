import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, text,
  timestamp, integer, boolean,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { User } from './User';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const otpPurposeEnum = pgEnum('otp_purpose', [
  'email_verification',
  'phone_verification',
  'password_reset',
  'new_password',
  'login',
  'device_verification',
]);

export const otpChannelEnum = pgEnum('otp_channel', [
  'sms',
  'email',
  'whatsapp',
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const OtpToken = pgTable(
  'otp_tokens',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' }),
    // nullable — OTP can be sent before user account exists (registration flow)

    identifier: varchar('identifier', { length: 255 })
      .notNull(),
    // email address or phone number — what the OTP was sent to

    token_hash: text('token_hash')
      .notNull(),
    // bcrypt hash of the 6-digit OTP — never store plain OTP
    // using text instead of varchar — bcrypt hash length can vary

    purpose: otpPurposeEnum('purpose')
      .notNull(),

    channel: otpChannelEnum('channel')
      .default('sms')
      .notNull(),
    // how the OTP was delivered

    attempts: integer('attempts')
      .default(0)
      .notNull(),
    // incremented on each wrong attempt — blocked after MAX_ATTEMPTS (5)

    is_used: boolean('is_used')
      .default(false)
      .notNull(),
    // explicit flag for fast indexed queries — dont rely on used_at null check alone

    expires_at: timestamp('expires_at', { mode: 'date' })
      .notNull(),
    // OTP valid for 10 minutes from creation

    used_at: timestamp('used_at', { mode: 'date' }),
    // null = not used yet | timestamp = when it was consumed

    last_requested_at: timestamp('last_requested_at', { mode: 'date' }),
    // tracks when user last requested OTP for this identifier
    // used to enforce resend cooldown (e.g. cant resend within 60 seconds)

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('otp_identifier_idx').on(table.identifier),
    index('otp_purpose_idx').on(table.purpose),
    index('otp_channel_idx').on(table.channel),
    index('otp_user_id_idx').on(table.user_id),
    index('otp_is_used_idx').on(table.is_used),
    index('otp_expires_at_idx').on(table.expires_at),

    // quickly find all active tokens for a user + purpose
    index('otp_user_purpose_idx').on(table.user_id, table.purpose),

    // Composite — most common query:
    // WHERE identifier = ? AND purpose = ? AND is_used = false ORDER BY created_at DESC
    index('otp_identifier_purpose_used_idx').on(
      table.identifier,
      table.purpose,
      table.is_used,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const otpTokenRelations = relations(OtpToken, ({ one }) => ({
  user: one(User, {
    fields:     [OtpToken.user_id],
    references: [User.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type OtpTokenRow    = typeof OtpToken.$inferSelect;
export type OtpTokenInsert = typeof OtpToken.$inferInsert;