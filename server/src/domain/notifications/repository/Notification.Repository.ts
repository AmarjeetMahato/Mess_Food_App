import type { DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import {injectable, inject} from "tsyringe"
import { INotificationRepository } from "./INotification.Repository";
import { Notification, NotificationRow } from "@/config/models";
import { NotificationEntity } from "../entity/notificationeEntity";
import { NotificationMapper } from "../mapper/Notification.Mapper";
import { InternalServerError } from "@/globalError/AppError";
import { and, eq } from "drizzle-orm";
import { notificationChannelZodEnumDto, notificationReferenceTypeZodEnumDto, notificationStatusZodEnumDto, notificationTypeZodEnumDto } from "../dtos/NotificationDtos";


@injectable()
export class NotificationRepository implements INotificationRepository{
    constructor(@inject(TOKENS.DB) private db: DbOrTx){}
    
   async  createNotification(entity: NotificationEntity): Promise<NotificationRow> {
            const payload = NotificationMapper.toPersistence(entity);
            const [row] = await this.db.insert(Notification)
                                       .values(payload)
                                       .returning()

            if(!row){
                  throw new InternalServerError("Failed to create notification")
            }   
            
            return row;
    }

    async updateNotification(entity: NotificationEntity, id:string): Promise<NotificationRow> {
          const payload = NotificationMapper.toPersistence(entity);
          const [row]  = await this.db.update(Notification)
                                       .set({
                                           ...payload,
                                           created_at:new Date()
                                       })
                                       .where(eq(Notification.id, id))
                                       .returning();
          
            if(!row){
                  throw new InternalServerError("Failed to create notification")
            }   
            
            return row;                             

    }
    async getById(id: string): Promise<NotificationRow | null> {
        return this.db.select().from(Notification)
                               .where(eq(Notification.id, id))
                               .then(row=>row[0] || null)
                
    }
    getByUserId(userId: string, options?: { limit?: number; offset?: number; }): Promise<NotificationRow[]> {
        throw new Error("Method not implemented.");
    }

   async getByReference(referenceId: string, referenceType: notificationReferenceTypeZodEnumDto): Promise<NotificationRow[]> {
        return await this.db
    .select()
    .from(Notification)
    .where(
      and(
        eq(Notification.reference_id, referenceId),
        eq(Notification.reference_type, referenceType)
      )
    );
    }

   async  markAsRead(id: string): Promise<NotificationRow | null> {
        const [row] = await this.db.update(Notification)
                                    .set({
                                         is_read:true,
                                          read_at:new Date(),
                                          status:"read"

                                    })
                                     .where(eq(Notification.id,id))
                                     .returning()
         return row ?? null;                             
    }

    async deleteNotification(id: string): Promise<void> {
  await this.db
    .delete(Notification)
    .where(eq(Notification.id, id));
}

async listNotifications(options?: {userId?: string;
  status?: notificationStatusZodEnumDto;
  type?: notificationTypeZodEnumDto;
  channel?: notificationChannelZodEnumDto;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationRow[]> {

  const conditions = [];

  if (options?.userId) {
    conditions.push(eq(Notification.user_id, options.userId));
  }

  if (options?.status) {
    conditions.push(eq(Notification.status, options.status));
  }

  if (options?.type) {
    conditions.push(eq(Notification.type, options.type));
  }

  if (options?.channel) {
    conditions.push(eq(Notification.channel, options.channel));
  }

  if (options?.isRead !== undefined) {
    conditions.push(eq(Notification.is_read, options.isRead));
  }

  const query = this.db
    .select()
    .from(Notification)
    .where(conditions.length ? and(...conditions) : undefined)
    .limit(options?.limit ?? 20)
    .offset(options?.offset ?? 0);

  return await query;
}
}