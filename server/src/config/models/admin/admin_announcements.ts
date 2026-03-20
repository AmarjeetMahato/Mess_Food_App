import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, varchar, text,
  boolean, timestamp,
  index, pgEnum,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';

// ─── Enums ────────────────────────────────────────────────────────────────────

export const announcementTypeEnum = pgEnum('announcement_type', [
  'general',          // general info — e.g. "Mess will be closed on Sunday"
  'menu_change',      // menu updated — e.g. "Today's lunch menu changed"
  'maintenance',      // system/mess maintenance notice
  'holiday',          // holiday notice — no meals on this date
  'important',        // urgent notice — shown with high priority
]);

export const announcementAudienceEnum = pgEnum('announcement_audience', [
  'all',              // everyone — students, staff, drivers
  'students',         // only student role users
  'staff',            // only staff role users
  'drivers',          // only driver role users
  'subscribers',      // only users with active subscriptions
]);

// ─── Table ────────────────────────────────────────────────────────────────────

export const AdminAnnouncement = pgTable(
  'admin_announcements',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    created_by: uuid('created_by')
      .references(() => User.id, { onDelete: 'set null' }),
    // admin who created this announcement
    // set null — keep announcement even if admin account deleted

    title: varchar('title', { length: 255 })
      .notNull(),
    // e.g. "No Dinner on Sunday 23rd March"

    body: text('body')
      .notNull(),
    // full announcement message

    type: announcementTypeEnum('type')
      .default('general')
      .notNull(),

    audience: announcementAudienceEnum('audience')
      .default('all')
      .notNull(),
    // who should see this announcement

    is_active: boolean('is_active')
      .default(true)
      .notNull(),
    // false = announcement withdrawn / hidden

    is_pinned: boolean('is_pinned')
      .default(false)
      .notNull(),
    // pinned announcements shown at top of notice board

    publish_at: timestamp('publish_at', { mode: 'date' })
      .notNull(),
    // when to show this announcement — can be scheduled in future
    // announcement is not visible before this time

    expires_at: timestamp('expires_at', { mode: 'date' }),
    // optional — announcement auto-hides after this time
    // null = no expiry, stays visible until manually deactivated

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),

    updated_at: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('announcement_created_by_idx').on(table.created_by),
    index('announcement_type_idx').on(table.type),
    index('announcement_audience_idx').on(table.audience),
    index('announcement_is_active_idx').on(table.is_active),
    index('announcement_is_pinned_idx').on(table.is_pinned),
    index('announcement_publish_at_idx').on(table.publish_at),
    index('announcement_expires_at_idx').on(table.expires_at),

    // Composite — fetch active visible announcements for a specific audience
    // WHERE is_active = true AND audience IN ('all', ?) AND publish_at <= NOW()
    index('announcement_active_audience_publish_idx').on(
      table.is_active,
      table.audience,
      table.publish_at,
    ),

    // Composite — pinned active announcements first
    // WHERE is_active = true AND is_pinned = true
    index('announcement_active_pinned_idx').on(
      table.is_active,
      table.is_pinned,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const adminAnnouncementRelations = relations(AdminAnnouncement, ({ one }) => ({
  createdBy: one(User, {
    fields:     [AdminAnnouncement.created_by],
    references: [User.id],
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type AdminAnnouncementRow    = typeof AdminAnnouncement.$inferSelect;
export type AdminAnnouncementInsert = typeof AdminAnnouncement.$inferInsert;