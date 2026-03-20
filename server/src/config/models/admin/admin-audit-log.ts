import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, text,
  timestamp, index, pgEnum, inet,
  jsonb,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const auditActionEnum = pgEnum('audit_action', [
  // User management
  'user_created',
  'user_updated',
  'user_banned',
  'user_activated',
  'user_role_changed',

  // Menu management
  'menu_item_created',
  'menu_item_updated',
  'menu_item_deleted',
  'daily_menu_created',
  'daily_menu_updated',

  // Subscription management
  'subscription_created',
  'subscription_cancelled',
  'subscription_paused',
  'subscription_resumed',

  // Wallet management
  'wallet_adjusted',       // admin manually adjusted balance
  'recharge_refunded',     // admin issued refund

  // Delivery management
  'delivery_agent_created',
  'delivery_agent_suspended',
  'delivery_order_assigned',
  'delivery_order_cancelled',

  // Announcement
  'announcement_created',
  'announcement_updated',
  'announcement_deleted',

  // Settings
  'settings_updated',
]);

export const auditEntityTypeEnum = pgEnum('audit_entity_type', [
  'user',
  'menu_item',
  'daily_menu',
  'subscription',
  'wallet',
  'recharge',
  'delivery_agent',
  'delivery_order',
  'announcement',
  'settings',
]);

// ─── Table ────────────────────────────────────────────────────────────────────
// Append-only — never update or delete audit log entries
// Every admin action must produce one audit log entry
// Used for: compliance, debugging, dispute resolution

export const AdminAuditLog = pgTable(
  'admin_audit_logs',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    admin_id: uuid('admin_id')
      .references(() => User.id, { onDelete: 'set null' }),
    // which admin performed the action
    // set null — keep log even if admin account deleted

    action: auditActionEnum('action')
      .notNull(),
    // what action was performed

    entity_type: auditEntityTypeEnum('entity_type')
      .notNull(),
    // which type of entity was affected

    entity_id: uuid('entity_id')
      .notNull(),
    // id of the affected entity
    // no FK — flexible across multiple tables

    description: varchar('description', { length: 500 })
      .notNull(),
    // human readable summary
    // e.g. "Admin banned user john@example.com for policy violation"
    // e.g. "Admin adjusted wallet balance by +₹500 for user ID xyz"

    before_state: jsonb('before_state'),
    // snapshot of entity state BEFORE the action
    // null for create actions — nothing existed before
    // stored as JSONB for flexible querying

    after_state: jsonb('after_state'),
    // snapshot of entity state AFTER the action
    // null for delete actions — nothing exists after
    // stored as JSONB for flexible querying

    ip_address: inet('ip_address'),
    // admin's IP at time of action
    // used for security auditing

    user_agent: varchar('user_agent', { length: 500 }),
    // admin's browser / device at time of action

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    // append-only — no updated_at needed
  },
  (table) => [
    index('audit_admin_idx').on(table.admin_id),
    index('audit_action_idx').on(table.action),
    index('audit_entity_type_idx').on(table.entity_type),
    index('audit_entity_id_idx').on(table.entity_id),
    index('audit_created_at_idx').on(table.created_at),

    // Composite — full history of a specific entity
    // WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC
    index('audit_entity_type_id_idx').on(
      table.entity_type,
      table.entity_id,
    ),

    // Composite — everything a specific admin did
    // WHERE admin_id = ? ORDER BY created_at DESC
    index('audit_admin_created_at_idx').on(
      table.admin_id,
      table.created_at,
    ),

    // Composite — all actions of a specific type in a date range
    // WHERE action = ? AND created_at BETWEEN ? AND ?
    index('audit_action_created_at_idx').on(
      table.action,
      table.created_at,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const adminAuditLogRelations = relations(AdminAuditLog, ({ one }) => ({
  admin: one(User, {
    fields:     [AdminAuditLog.admin_id],
    references: [User.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminAuditLogRow    = typeof AdminAuditLog.$inferSelect;
export type AdminAuditLogInsert = typeof AdminAuditLog.$inferInsert;