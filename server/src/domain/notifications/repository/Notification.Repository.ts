import type { DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import {injectable, inject} from "tsyringe"
import { INotificationRepository } from "./INotification.Repository";
import { NotificationRow } from "@/config/models";
import { NotificationEntity } from "../entity/notificationeEntity";


@injectable()
export class NotificationRepository implements INotificationRepository{
    constructor(@inject(TOKENS.DB) private db: DbOrTx){}
    
    createNotification(entity: NotificationEntity): Promise<NotificationRow> {
        throw new Error("Method not implemented.");
    }
    updateNotification(entity: NotificationEntity): Promise<NotificationRow> {
        throw new Error("Method not implemented.");
    }
    getById(id: string): Promise<NotificationRow | null> {
        throw new Error("Method not implemented.");
    }
    getByUserId(userId: string, options?: { limit?: number; offset?: number; }): Promise<NotificationRow[]> {
        throw new Error("Method not implemented.");
    }
    getByReference(referenceId: string, referenceType: string): Promise<NotificationRow[]> {
        throw new Error("Method not implemented.");
    }
    markAsRead(id: string): Promise<NotificationRow | null> {
        throw new Error("Method not implemented.");
    }
    deleteNotification(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    listNotifications(options?: { userId?: string; status?: string; type?: string; channel?: string; isRead?: boolean; limit?: number; offset?: number; }): Promise<NotificationRow[]> {
        throw new Error("Method not implemented.");
    }
}