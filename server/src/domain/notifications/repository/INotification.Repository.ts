import { NotificationRow } from "@/config/models";
import { NotificationEntity } from "../entity/notificationeEntity";


export interface INotificationRepository {
  // ─────────────────────────────────────────────
  // ✅ Create a new notification
  // ─────────────────────────────────────────────
  createNotification(entity: NotificationEntity): Promise<NotificationRow>;

  // ─────────────────────────────────────────────
  // ✅ Update an existing notification
  // ─────────────────────────────────────────────
  updateNotification(entity: NotificationEntity): Promise<NotificationRow>;

  // ─────────────────────────────────────────────
  // ✅ Find notification by ID
  // ─────────────────────────────────────────────
  getById(id: string): Promise<NotificationRow | null>;

  // ─────────────────────────────────────────────
  // ✅ Find notifications by user ID
  // ─────────────────────────────────────────────
  getByUserId(userId: string, options?: { limit?: number; offset?: number }): Promise<NotificationRow[]>;

  // ─────────────────────────────────────────────
  // ✅ Find notifications by reference (delivery/subscription/wallet)
  // ─────────────────────────────────────────────
  getByReference(referenceId: string, referenceType: string): Promise<NotificationRow[]>;

  // ─────────────────────────────────────────────
  // ✅ Mark a notification as read
  // ─────────────────────────────────────────────
  markAsRead(id: string): Promise<NotificationRow | null>;

  // ─────────────────────────────────────────────
  // ✅ Delete notification (soft delete or hard delete)
  // ─────────────────────────────────────────────
  deleteNotification(id: string): Promise<void>;

  // ─────────────────────────────────────────────
  // ✅ List notifications with filters
  // ─────────────────────────────────────────────
  listNotifications(options?: {
    userId?: string;
    status?: string;
    type?: string;
    channel?: string;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NotificationRow[]>;
}