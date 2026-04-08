
import { CreateNotificationInput, notificationChannelZodEnumDto, notificationReferenceTypeZodEnumDto, NotificationResponse, notificationStatusZodEnumDto, notificationTypeZodEnumDto, UpdateNotificationInput } from "../dtos/NotificationDtos";

export interface INotificationService {

  // ─────────────────────────────────────────────
  // ✅ Create
  // ─────────────────────────────────────────────
  createNotification(dto: CreateNotificationInput, userId:string): Promise<NotificationResponse>;

  createBulkNotifications(dtos: CreateNotificationInput[]): Promise<NotificationResponse[]>;

  // ─────────────────────────────────────────────
  // ✅ Read
  // ─────────────────────────────────────────────
  getNotificationById(id: string): Promise<NotificationResponse | null>;

  getNotificationsByUser(userId: string,options?: {limit?: number;offset?: number}): Promise<NotificationResponse[]>;

  getNotificationsByReference(referenceId: string,referenceType: notificationReferenceTypeZodEnumDto): Promise<NotificationResponse[]>;

  listNotifications(options?: {
    userId?: string;
    status?: notificationStatusZodEnumDto;
    type?: notificationTypeZodEnumDto;
    channel?: notificationChannelZodEnumDto;
    isRead?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<NotificationResponse[]>;

  // ─────────────────────────────────────────────
  // ✅ Update
  // ─────────────────────────────────────────────
  updateNotification(id: string,userId:string, dto: UpdateNotificationInput): Promise<NotificationResponse | null>;

  // ─────────────────────────────────────────────
  // ✅ Delete
  // ─────────────────────────────────────────────
  deleteNotification(id: string): Promise<void>;

  // ─────────────────────────────────────────────
  // ✅ Business Logic
  // ─────────────────────────────────────────────
  markAsRead(id: string): Promise<NotificationResponse | null>;

  markAllAsRead(userId: string): Promise<void>;

  getUnreadCount(userId: string): Promise<number>;
}