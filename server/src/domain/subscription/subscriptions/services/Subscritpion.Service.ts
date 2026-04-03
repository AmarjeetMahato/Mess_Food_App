import { inject, injectable } from "tsyringe";
import { ISubscriptionService } from "./ISubscription.Service";
import { CreateSubscriptionDto, SubscriptionResponseDto, UpdateSubscriptionDto } from "../dtos/subscriptionDtos";
import { TOKENS } from "@/helper/subscriptions/tokens";
import type { ISubscriptionRepository } from "../repository/ISubscription.Repository";
import { BadRequestError, ConflictError, InternalServerError, NotFoundError, UnauthorizedError } from "@/globalError/AppError";
import { SubscriptionMapper } from "../mapper/Subscription.Mapper";



@injectable()
export class SubscriptionService implements ISubscriptionService{

    constructor(@inject(TOKENS.SubscriptionRepository) private repository:ISubscriptionRepository){}

    async createSubscription(data: CreateSubscriptionDto, userId:string): Promise<SubscriptionResponseDto> {
              if(!data){
                  throw new BadRequestError("Invaild input fileds")
              }
               // ─────────────────────────────────────────────
                // 🔥 Business Rule 1: Only one active subscription per user
                 // ─────────────────────────────────────────────
              const existing = await this.repository.getActiveByUserId(data.userId);
              if(existing){
                   throw new ConflictError("User already has an active subscription");
              }   

                // ─────────────────────────────────────────────
                // 🔥 Business Rule 2: Calculate remainingDays (DON'T trust DTO)
                // ─────────────────────────────────────────────
                 const consumedDays = data.consumedDays ?? 0;
                  const remainingDays = data.totalDays - consumedDays;

                  if(remainingDays > 0){
                      throw new BadRequestError("Remaining days cannot be negative");
                      
                  }
                   // ─────────────────────────────────────────────
                    // 🔥 Business Rule 3: Date validation
                 // ─────────────────────────────────────────────
               if(data.endDate <= data.startDate){
                  throw new BadRequestError("endDate must be greater than startDate");
               }

              // ─────────────────────────────────────────────
              // 🔥 Business Rule 4: At least one meal slot
              // ─────────────────────────────────────────────
              if(!data.hasBreakfast && !data.hasLunch && !data.hasSnacks && !data.hasDinner){
                  throw new BadRequestError("At least one meal slot must be selected");  
              }

              const createEntity = SubscriptionMapper.toCreateEntity({
                                ...data,
                                userId:userId,
                                consumedDays,
                                remainingDays
              });

              const subscription = await this.repository.createSubscription(createEntity);
              if(!subscription){
                  throw new InternalServerError("Failed to create subscription")
              }
            
              const savedEntity = SubscriptionMapper.toEntity(subscription);
              if(savedEntity.endDate < new Date()){
                 savedEntity.status="expired"
              }

                // 2️⃣ Safety check (consistency)
             if (savedEntity.remainingDays !== savedEntity.totalDays - savedEntity.consumedDays) {      
                      throw new InternalServerError("Data inconsistency detected in subscription");
              }
              return SubscriptionMapper.toResponseDto(savedEntity);
    }

    async updateSubscription(id: string, data: UpdateSubscriptionDto,userId:string): Promise<SubscriptionResponseDto> {
                     if(!id){
                          throw new BadRequestError("Subcription id is required")
                     }
                     if(!data){
                         throw new BadRequestError("Invalid value fields")
                     }

                     const existing = await this.repository.getById(id);
                     if(!existing){
                          throw new NotFoundError("Subcription not found");  
                     }

                     if(existing.user_id !== userId){
                           throw new UnauthorizedError("Unauthorized user")
                     }

                     const entity = SubscriptionMapper.toEntity(existing)

                       // status updates via domain methods
                    if (data.status) {
                    switch (data.status) {   // ✅ FIX
                         case "paused":
                                 entity.pause();
                                 break;

                         case "active":
                           entity.resume();
                           break;

                         case "cancelled":
                           entity.cancel();
                           break;

                         case "expired":
                           entity.status = "expired";
                           entity.updatedAt = new Date();
                           break;
                           default:
                             throw new BadRequestError("Invalid status value");  
                     }
                  }
                  
                     if(data.endDate){
                          if(data.endDate <= entity.startDate){
                              throw new BadRequestError("endDate must be greater than startDate")
                          }

                          entity.endDate = data.endDate;
                          entity.updatedAt  = new Date()
                     }

                     if(data.autoRenew !== undefined){
                           entity.autoRenew = data.autoRenew
                           entity.updatedAt = new Date()
                     }

                     if(data.consumedDays !== undefined){
                         if(data.consumedDays < 0){
                             throw new BadRequestError("Invalid consumedDays")
                         }

                         entity.consumedDays = data.consumedDays;
                         entity.remainingDays = entity.totalDays - data.consumedDays;
                         entity.updatedAt = new Date()
                     }

                     const updateRow = await this.repository.updateSubscription(id,entity)
                     if(!updateRow){
                          throw new InternalServerError("Failed to create Subscription")
                     }

                     const updatedEntity  = SubscriptionMapper.toEntity(updateRow);
                     return SubscriptionMapper.toResponseDto(updatedEntity);

                     
    }

    async getSubscriptionById(id: string): Promise<SubscriptionResponseDto> {
               if(!id){
                     throw new BadRequestError(" Subscription id is required")
               }
               
               const subscription = await this.repository.getById(id);
               if(!subscription || !subscription.id){
                    throw new NotFoundError(" Subscription not found")
               }

               const entity = SubscriptionMapper.toEntity(subscription);
                     // 🔥 Optional business logic (safe, non-blocking)
            if (entity.isExpired() && entity.status !== "expired") {
                     entity.status = "expired";
                     }

            return SubscriptionMapper.toResponseDto(entity)
    }

    async getActiveSubscriptionByUserId(userId: string): Promise<SubscriptionResponseDto | null> {
           if(!userId){
               throw new BadRequestError("UserId should not be empty")
           }

           const subscription = await this.repository.getActiveByUserId(userId);
           if(!subscription || !subscription.id){
                 throw new NotFoundError("No active subscription found for this user");
           }

           const entity = SubscriptionMapper.toEntity(subscription);
           if(!entity.isActive()){
                  throw new BadRequestError("Subscription is not active");
           }
           return SubscriptionMapper.toResponseDto(entity);
    }

    async getSubscriptionsByUserId(userId: string): Promise<SubscriptionResponseDto[]> {
            if(!userId){
                  throw new BadRequestError("UserId should not be empty")
            }

            const subscription = await this.repository.getByUserId(userId);
           if(!subscription || subscription.length === 0){
                throw new Error("No subscrption found by the User")
           }

           const entity =  SubscriptionMapper.toEntityArray(subscription);
           return SubscriptionMapper.toResponseDtoArray(entity);

    }

   async pauseSubscription(id: string): Promise<SubscriptionResponseDto> {
             if(!id){
                  throw new BadRequestError("Subscription id is required")
             }

             const subscription =  await this.repository.pauseSubscription(id);
             if(!subscription || !subscription.id){
                   throw new NotFoundError("Subscription not found")
             }
             const entity = SubscriptionMapper.toEntity(subscription);
             return SubscriptionMapper.toResponseDto(entity);
    }

    async resumeSubscription(id: string): Promise<SubscriptionResponseDto> {
          if(!id){
                  throw new BadRequestError("Subscription id is required")
             }

             const subscription =  await this.repository.resumeSubscription(id);
             if(!subscription || !subscription.id){
                   throw new NotFoundError("Subscription not found")
             }
             const entity = SubscriptionMapper.toEntity(subscription);
             return SubscriptionMapper.toResponseDto(entity);
    }

   async  cancelSubscription(id: string): Promise<SubscriptionResponseDto> {
          if(!id){
                  throw new BadRequestError("Subscription id is required")
             }

             const subscription =  await this.repository.resumeSubscription(id);
             if(!subscription || !subscription.id){
                   throw new NotFoundError("Subscription not found")
             }
             const entity = SubscriptionMapper.toEntity(subscription);
             return SubscriptionMapper.toResponseDto(entity);
    }

}