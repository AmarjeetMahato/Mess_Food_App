import { relations } from 'drizzle-orm';
import {
  pgTable, uuid, boolean,
  timestamp, date, index,
} from 'drizzle-orm/pg-core';
import { User } from '../user_and_auth/User';
import { Subscription } from './subscription';
import { DailyMenu, mealSlotEnum } from '../menu/daily-menu';

// ─── Table ────────────────────────────────────────────────────────────────────

export const MealAttendance = pgTable(
  'meal_attendance',
  {
    id: uuid('id')
      .defaultRandom()
      .primaryKey(),

    user_id: uuid('user_id')
      .references(() => User.id, { onDelete: 'cascade' })
      .notNull(),

    subscription_id: uuid('subscription_id')
      .references(() => Subscription.id, { onDelete: 'cascade' })
      .notNull(),
    // which subscription this attendance is against
    // used to increment consumed_days on the subscription

    daily_menu_id: uuid('daily_menu_id')
      .references(() => DailyMenu.id, { onDelete: 'restrict' })
      .notNull(),
    // which daily menu slot was attended

    slot: mealSlotEnum('slot')
      .notNull(),
    // reusing enum — breakfast | lunch | snacks | dinner

    attendance_date: date('attendance_date', { mode: 'date' })
      .notNull(),
    // the date of attendance — redundant with daily_menu but
    // kept for fast date-range queries without joining daily_menu

    is_consumed: boolean('is_consumed')
      .default(false)
      .notNull(),
    // false = record created (expected attendance)
    // true  = QR scanned, meal actually consumed

    scanned_at: timestamp('scanned_at', { mode: 'date' }),
    // exact timestamp of QR scan — null if not yet consumed

    scanned_by: uuid('scanned_by')
      .references(() => User.id, { onDelete: 'set null' }),
    // who performed the scan — delivery agent or mess staff (admin/user)

        // ✅ NEW FIELDS
    created_by: uuid('created_by')
      .references(() => User.id, { onDelete: 'set null' }),

    updated_by: uuid('updated_by')
      .references(() => User.id, { onDelete: 'set null' }),

    created_at: timestamp('created_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    
      updated_at: timestamp('updated_at', {mode:'date'}).defaultNow().notNull()


  },
  (table) => [
    index('attendance_user_idx').on(table.user_id),
    index('attendance_subscription_idx').on(table.subscription_id),
    index('attendance_daily_menu_idx').on(table.daily_menu_id),
    index('attendance_date_idx').on(table.attendance_date),
    index('attendance_slot_idx').on(table.slot),
    index('attendance_is_consumed_idx').on(table.is_consumed),
    index('attendance_scanned_by_idx').on(table.scanned_by),

    // Composite — check if attendance already marked for user on date + slot
    // WHERE user_id = ? AND attendance_date = ? AND slot = ?
    index('attendance_user_date_slot_idx').on(
      table.user_id,
      table.attendance_date,
      table.slot,
    ),

    // Composite — admin dashboard: all attendance for a slot on a date
    // WHERE daily_menu_id = ? AND is_consumed = true
    index('attendance_menu_consumed_idx').on(
      table.daily_menu_id,
      table.is_consumed,
    ),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const mealAttendanceRelations = relations(MealAttendance, ({ one }) => ({
  user: one(User, {
    fields:     [MealAttendance.user_id],
    references: [User.id],
  }),
  subscription: one(Subscription, {
    fields:     [MealAttendance.subscription_id],
    references: [Subscription.id],
  }),
  dailyMenu: one(DailyMenu, {
    fields:     [MealAttendance.daily_menu_id],
    references: [DailyMenu.id],
  }),
  scannedBy: one(User, {
    fields:     [MealAttendance.scanned_by],
    references: [User.id],
    relationName: 'scannedByUser',
  }),
    createdBy: one(User, {
    fields: [MealAttendance.created_by],
    references: [User.id],
    relationName: 'mealAttendanceCreatedBy',
  }),

  updatedBy: one(User, {
    fields: [MealAttendance.updated_by],
    references: [User.id],
    relationName: 'mealAttendanceUpdatedBy',
  }),
}));

// ─── Types ────────────────────────────────────────────────────────────────────

export type MealAttendanceRow    = typeof MealAttendance.$inferSelect;
export type MealAttendanceInsert = typeof MealAttendance.$inferInsert;