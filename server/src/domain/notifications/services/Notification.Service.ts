
import {injectable, inject} from "tsyringe"
import { INotificationService } from "./INotification.Service";
import { CreateNotificationInput, NotificationResponse, notificationReferenceTypeZodEnumDto, notificationStatusZodEnumDto, notificationTypeZodEnumDto, notificationChannelZodEnumDto, UpdateNotificationInput } from "../dtos/NotificationDtos";
import { TOKENS } from "@/helper/notifications/tokens";
import {TOKENS as AUTH_TOKENS} from "@/helper/user_and_auth/token"
import type { INotificationRepository } from "../repository/INotification.Repository";
import { BadRequestError, NotFoundError } from "@/globalError/AppError";
import { NotificationMapper } from "../mapper/Notification.Mapper";
import type { IUserService } from "@/domain/auth_and_user/users/services/IUser.Service";
import { exists } from "drizzle-orm";

@injectable()
export class NotificationService implements INotificationService{
     
       constructor(
        @inject(TOKENS.NotificationRepository) private readonly repository: INotificationRepository,
       @inject(AUTH_TOKENS.UserService) private readonly userService: IUserService
    ){}

    async createNotification(dto: CreateNotificationInput,userId:string): Promise<NotificationResponse> {
           if(!userId){
               throw new BadRequestError("UserId should not be empty or null");
           }
          if(!dto){
              throw new BadRequestError("Invalid input fileds");
          }
          
          if(dto.reference_id !== dto.reference_type){
             throw new BadRequestError("reference_id is required when reference_type is provided")
          }

          await this.userService.getUserById(userId);
           
          const createEntity  = NotificationMapper.toCreateEntity({
                                      ...dto,
                                      user_id:userId
          });

          const notification = await this.repository.createNotification(createEntity);
          const entity = NotificationMapper.toEntity(notification);
          return NotificationMapper.toResponseDto(entity);


    }

    createBulkNotifications(dtos: CreateNotificationInput[]): Promise<NotificationResponse[]> {
        throw new Error("Method not implemented.");
    }


   async getNotificationById(id: string): Promise<NotificationResponse | null> {
              if(!id){
                  throw new BadRequestError("Notification Id should not be empty or null");
              }

              const existing = await this.getNotificationById(id);
              if(!existing || !existing.id){
                  throw new NotFoundError("Notification details not found")
              }
              const entity = NotificationMapper.toEntity(existing);
              return NotificationMapper.toResponseDto(entity);

    }

    async getNotificationsByUser(userId: string, options?: { limit?: number; offset?: number; }): Promise<NotificationResponse[]> {
              if(!userId){
                  throw new BadRequestError("userId should not be empty or null");
              }

              const notifications = await this.repository.getByUserId(userId,options);
              if(!notifications || notifications.length === 0){
                 return []
              }
              
          const entityArray = NotificationMapper.toEntityArray(notifications);
          return NotificationMapper.toResponseDtoArray(entityArray);
    }

    async getNotificationsByReference(referenceId: string, referenceType: notificationReferenceTypeZodEnumDto): Promise<NotificationResponse[]> {
          if(!referenceId || !referenceType){
             throw new BadRequestError("referenceId and referenceType shouldn't be null")
          }

          const exiting = await this.repository.getByReference(referenceId, referenceType);
          if(!exiting || exiting.length === 0){
              return []
          }

          const entityArray = NotificationMapper.toEntityArray(exiting);
          return NotificationMapper.toResponseDtoArray(entityArray);
    }

    listNotifications(options?: { userId?: string; status?: notificationStatusZodEnumDto; type?: notificationTypeZodEnumDto; channel?: notificationChannelZodEnumDto; isRead?: boolean; limit?: number; offset?: number; }): Promise<NotificationResponse[]> {
        throw new Error("Method not implemented.");
    }
    async updateNotification(id: string, dto: UpdateNotificationInput): Promise<NotificationResponse | null> {
                 if(!id){
                  throw new BadRequestError("Notification Id should not be empty or null");
              }
                  if(!dto){
              throw new BadRequestError("Invalid input fileds");
          }
          
          const existing = await this.repository.getById(id);
          if(!existing || !existing.id){
              throw new NotFoundError("Notification not found");
          }

          const entity = NotificationMapper.toEntity(existing);
            // ─── Business Logic (IMPORTANT) ─────────────
          if(dto.status){
                 entity.updateStatus(dto.status, dto.failed_reason);
          }

            // ✅ Read handling
  if (dto.is_read === true && !entity.is_read) {
    entity.markAsRead();
  }

  // ─── Other Field Updates ────────────────────
  if (dto.title !== undefined) entity.title = dto.title;
  if (dto.body !== undefined) entity.body = dto.body;

    if (dto.reference_id !== undefined) {
    entity.reference_id = dto.reference_id ?? null;
  }

  if (dto.reference_type !== undefined) {
    entity.reference_type = dto.reference_type ?? null;
  }

  if (dto.sent_at !== undefined) {
    entity.sent_at = dto.sent_at ?? null;
  }

  if (dto.read_at !== undefined) {
    entity.read_at = dto.read_at ?? null;
  }

   if (dto.failed_reason !== undefined && entity.status !== 'failed') {
    entity.failed_reason = dto.failed_reason ?? null;
  }

  // ─── Persist ───────────────────────────────
  const updatedRow = await this.repository.updateNotification(entity, id);

  // ─── Return Response ───────────────────────
  const updatedEntity = NotificationMapper.toEntity(updatedRow);

  return NotificationMapper.toResponseDto(updatedEntity);


    }
    deleteNotification(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async  markAsRead(id: string): Promise<NotificationResponse | null> {
                 if(!id){
                  throw new BadRequestError("Notification Id should not be empty or null");
              }

              const exsting  = await this.repository.markAsRead(id);
              if(!exsting || !exsting.id){
                  throw new NotFoundError("Notification not found")
              }

              const entity = NotificationMapper.toEntity(exsting);
              return NotificationMapper.toResponseDto(entity);

 
    }
    async markAllAsRead(userId: string): Promise<void> {
          if (!userId) {
                throw new BadRequestError("UserId should not be empty or null");
                 }
           await this.repository.markAllAsRead(userId);
    }

   async  getUnreadCount(userId: string): Promise<number> {
          if (!userId) {
                throw new BadRequestError("UserId should not be empty or null");
             }
        return await this.repository.getUnreadCount(userId);
    }
}