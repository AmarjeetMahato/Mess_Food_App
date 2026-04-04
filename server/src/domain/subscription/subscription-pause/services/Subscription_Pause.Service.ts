import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import type { ISubscriptionPauseRepository } from "../repository/ISubscription_Pause.Repository";
import { ISubscriptionPauseService } from "./ISubscription_Pause.Service";
import { CreateSubscriptionPauseDto, SubscriptionPauseResponseDto, ResumeSubscriptionPauseDto, UpdateSubscriptionPauseDto, SubscriptionPauseQueryDto } from "../dtos/Subscription_PauesDtos";
import { BadRequestError, NotFoundError, UnauthorizedError } from "@/globalError/AppError";
import { SubscriptionMapper } from "../../subscriptions/mapper/Subscription.Mapper";
import type { ISubscriptionRepository } from "../../subscriptions/repository/ISubscription.Repository";
import { SubscriptionPauseMapper } from "../mapper/Subscription_Pause.Mapper";


@injectable()
export class SubscriptionPauseService implements ISubscriptionPauseService{
    constructor(
        @inject(TOKENS.SubscriptionPauserRepository) private readonly repository:ISubscriptionPauseRepository,
        @inject(TOKENS.SubscriptionService) private readonly SubRepository: ISubscriptionRepository
    ){}

    async pauseSubscription(data: CreateSubscriptionPauseDto, userId: string): Promise<SubscriptionPauseResponseDto> {
           if(!userId){ throw new BadRequestError("UserId is required")}

           if(!data){ throw new BadRequestError("Invalid input fields")}
           
        //    Fetch Subscription
        const subscription = await this.SubRepository.getById(data.subscriptionId);
        if(!subscription || !subscription.id){
               throw new NotFoundError("Subscription not found")
        }
        if(subscription.user_id !== userId){
              throw new UnauthorizedError("Unautorized user")
        }

        const subscriptionEntity  = SubscriptionMapper.toEntity(subscription);
        
        if(!subscriptionEntity.isActive()){
              throw new BadRequestError("Subscription is not active")
        }

        if(!subscriptionEntity.isExpired()){
                throw new BadRequestError("Subscription has expired")
        }

        // ✅ 3. Prevent double pause
        const existingPauses = await this.SubRepository.getActiveById(data.subscriptionId);

        if(existingPauses){
              throw new BadRequestError("Subscription already exists")
        }

        const pauseEntity  = SubscriptionPauseMapper.toCreateEntity(data, userId);

        pauseEntity.validatePauseRange()

        // save pause
        const createdRow = await this.repository.createPause(pauseEntity);
        
        const createdEntity = SubscriptionPauseMapper.toEntity(createdRow)

        subscriptionEntity.pause();

        await this.SubRepository.updateSubscription(subscription.id,subscriptionEntity)

        return SubscriptionPauseMapper.toResponseDto(createdEntity);

    }

    async resumeSubscriptionPause(data: ResumeSubscriptionPauseDto, userId: string): Promise<SubscriptionPauseResponseDto> {
            if(!userId){
                throw new BadRequestError("UserId is required")
            }
           if(!data){
               throw new BadRequestError("Invalid input fields")
           }

           const  pauseRow = await this.repository.getActivePauseBySubscriptionId(data.pauseId);
             if (!pauseRow) {
                    throw new NotFoundError("No active pause found");
                }
            
                const pauseEntity = SubscriptionPauseMapper.toEntity(pauseRow);
              // ✅ 2. Get subscription
              const subscriptionRow = await this.SubRepository.getById(data.pauseId)

                if (!subscriptionRow) {
                    throw new NotFoundError("Subscription not found");
                }
              
                if(subscriptionRow.user_id !== userId){
                      throw new UnauthorizedError("Unauthorized user")
                }

                const subscriptionEntity = SubscriptionMapper.toEntity(subscriptionRow)

                // ─────────────────────────────────────────────
  // ✅ 3. Business validation
  // ─────────────────────────────────────────────
  if (pauseEntity.isResumed) {
    throw new BadRequestError("Pause already resumed");
  }

  // ─────────────────────────────────────────────
  // ✅ 4. Resume pause (ENTITY LOGIC)
  // ─────────────────────────────────────────────
  pauseEntity.resume();  
  // 🔥 this should:
  // - set pauseEnd
  // - set resumedAt
  // - calculate daysPaused

  // ─────────────────────────────────────────────
  // ✅ 5. Update pause in DB
  // ─────────────────────────────────────────────
  const updatedPauseRow =
    await this.repository.resumePause(pauseEntity.id, {
      pauseEnd: pauseEntity.pauseEnd,
      resumedAt: pauseEntity.resumedAt,
      daysPaused: pauseEntity.daysPaused,
      isResumed: true,
    });

  const updatedPauseEntity =
    SubscriptionPauseMapper.toEntity(updatedPauseRow);

  // ─────────────────────────────────────────────
  // ✅ 6. Extend subscription (CORE LOGIC)
  // ─────────────────────────────────────────────
  if (pauseEntity.daysPaused) {
    const days = Number(pauseEntity.daysPaused);

    subscriptionEntity.endDate = new Date(
      subscriptionEntity.endDate.getTime() +
        days * 24 * 60 * 60 * 1000
    );

    subscriptionEntity.updatedAt = new Date();
  }

  // resume subscription status
  subscriptionEntity.resume();

  await this.SubRepository.updateSubscription(
    subscriptionEntity.id,
    subscriptionEntity
  );

  // ─────────────────────────────────────────────
  // ✅ 7. Return response
  // ─────────────────────────────────────────────
  return SubscriptionPauseMapper.toResponseDto(updatedPauseEntity);

    }

    
   async  getPauseById(id: string): Promise<SubscriptionPauseResponseDto> {
           if(!id){
               throw new BadRequestError("Subscription pause id is required")
           }

           const row = await this.repository.getById(id);

           if(!row || !row.id){
               throw new NotFoundError("Subcritpion pause not found");
           }

           const entity = SubscriptionPauseMapper.toEntity(row);

           return SubscriptionPauseMapper.toResponseDto(entity);
    }

    
    async getActivePauseBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseResponseDto | null> {
           if(!subscriptionId){
               throw new BadRequestError("subscriptionId is required")
           }

           const  row = await this.repository.getActivePauseBySubscriptionId(subscriptionId);
           if(!row || !row.id){
                 throw new NotFoundError("Active Subsription not found")
           }
           
           const entity = SubscriptionPauseMapper.toEntity(row);
           if(!entity.isActivePause){
               throw new BadRequestError("Subscription stauts not active ")
           }
           return SubscriptionPauseMapper.toResponseDto(entity);
    }


   async  getPausesBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseResponseDto[]> {
             if(!subscriptionId){
               throw new BadRequestError("subscriptionId is required")
           }

           const row = await this.repository.getBySubscriptionId(subscriptionId)
           if(!row || row.length === 0){
               throw new NotFoundError("No pauses found for this subscription")
           }

           const entity =  SubscriptionPauseMapper.toEntityArray(row);
           return SubscriptionPauseMapper.toResponseDtoArray(entity);
        
    }
    
   async getPausesByUserId(userId: string): Promise<SubscriptionPauseResponseDto[]> {
            if(!userId){
               throw new BadRequestError("UserId is required")
           }

           const row = await this.repository.getByUserId(userId);
           if(!row || row.length===0){
              throw new NotFoundError("Not Subscription found by userId")
           }
           
           const entity = SubscriptionPauseMapper.toEntityArray(row);
           return SubscriptionPauseMapper.toResponseDtoArray(entity);

    }

   async updatePause(id: string, data: UpdateSubscriptionPauseDto, userId: string): Promise<SubscriptionPauseResponseDto> {
                if(!id){
                    throw new BadRequestError("Subscription pause Id is required")
                }
                if(!userId){
                    throw new BadRequestError("userId is required")
                }
                
                if(!data){
                    throw  new BadRequestError("Invalid fields value")
                }

                const existingPause = await this.repository.getById(id);
                if(!existingPause || !existingPause.id){
                    throw new NotFoundError("Subscription pause not found")
                }

                const pauseEntity = SubscriptionPauseMapper.toEntity(existingPause);

                  // ✅ 2. Fetch subscription (ownership check)
                 const subscriptionRow = await this.SubRepository.getById(pauseEntity.subscriptionId);
                 
                 if(!subscriptionRow){
                    throw new NotFoundError("Subscription not found")
                 }

                 if(subscriptionRow.user_id !== userId){
                      throw new UnauthorizedError("Unauthorized User")
                 }

                //  Business Rule
                // Cannot update if already resume
                if(pauseEntity.isResumed){
                    throw new BadRequestError("Cannot upated a resumed pause")
                }

                if(data.reason !== undefined){
                      pauseEntity.reason = data.reason;
                }

                if(data.pauseEnd !== undefined){
                   if(data.pauseEnd <= pauseEntity.pauseStart){
                        throw new BadRequestError("pauseEnd must be greater than pauseStart")
                   }

                   pauseEntity.pauseEnd = data.pauseEnd;
                }

                if(data.isResumed === true){
                    pauseEntity.resume()
                }

                const updatedRow = await this.repository.updatePause(id,{
                   pauseEnd: pauseEntity.pauseEnd,
                   reason : pauseEntity.reason,
                   isResumed : pauseEntity.isResumed,
                   resumedAt: pauseEntity.resumedAt,
                   daysPaused: pauseEntity.daysPaused
                })

                const updatedEntity = SubscriptionPauseMapper.toEntity(updatedRow);
                return SubscriptionPauseMapper.toResponseDto(updatedEntity);

    }


   async getPausesByFilters(filters: SubscriptionPauseQueryDto): Promise<SubscriptionPauseResponseDto[]> {
           if(!filters){
               throw new BadRequestError("Filters are required")
           }

           if(filters.fromDate  && filters.toDate){
               if(filters.fromDate > filters.toDate){
                  throw new BadRequestError("fromDate cannot be greater than toDate")
               }
           }

           const rows = await this.repository.getByFilters({
                       subscriptionId:filters.subscriptionId!,
                       isResumed: filters.isResumed!,
                       fromDate: filters.fromDate!,
                       toDate:filters.toDate!
                    })

            if(!rows || rows.length===0){
                   return []
            }   
            
            const entities = SubscriptionPauseMapper.toEntityArray(rows);
            return SubscriptionPauseMapper.toResponseDtoArray(entities);
    }

    
}