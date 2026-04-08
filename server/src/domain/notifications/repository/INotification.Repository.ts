import { NotificationRow } from "@/config/models";
import { NotificationEntity } from "../entity/notificationeEntity";
import { notificationChannelZodEnumDto, notificationReferenceTypeZodEnumDto, notificationStatusZodEnumDto, notificationTypeZodEnumDto } from "../dtos/NotificationDtos";


export interface INotificationRepository {
  // ─────────────────────────────────────────────
  // ✅ Create a new notification
  // ─────────────────────────────────────────────
  createNotification(entity: NotificationEntity): Promise<NotificationRow>;

  // ─────────────────────────────────────────────
  // ✅ Update an existing notification
  // ─────────────────────────────────────────────
  updateNotification(entity: NotificationEntity, id:string): Promise<NotificationRow>;

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
  getByReference(referenceId: string, referenceType: notificationReferenceTypeZodEnumDto): Promise<NotificationRow[]>;

  // ─────────────────────────────────────────────
  // ✅ Mark a notification as read
  // ─────────────────────────────────────────────
  markAsRead(id: string): Promise<NotificationRow | null>;

  markAllAsRead(userId: string): Promise<void>

  getUnreadCount(userId: string): Promise<number>
  // ─────────────────────────────────────────────
  // ✅ Delete notification (soft delete or hard delete)
  // ─────────────────────────────────────────────
  deleteNotification(id: string): Promise<void>;

  // ─────────────────────────────────────────────
  // ✅ List notifications with filters
  // ─────────────────────────────────────────────
  listNotifications(options?: {
   userId?: string;
     status?: notificationStatusZodEnumDto;
     type?: notificationTypeZodEnumDto;
     channel?: notificationChannelZodEnumDto;
     isRead?: boolean;
     limit?: number;
     offset?: number;
  }): Promise<NotificationRow[]>;
}