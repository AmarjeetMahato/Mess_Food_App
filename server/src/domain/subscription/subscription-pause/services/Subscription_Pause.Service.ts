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

    
    getPauseById(id: string): Promise<SubscriptionPauseResponseDto> {
        throw new Error("Method not implemented.");
    }
    getActivePauseBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseResponseDto | null> {
        throw new Error("Method not implemented.");
    }
    getPausesBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    getPausesByUserId(userId: string): Promise<SubscriptionPauseResponseDto[]> {
        throw new Error("Method not implemented.");
    }
    updatePause(id: string, data: UpdateSubscriptionPauseDto, userId: string): Promise<SubscriptionPauseResponseDto> {
        throw new Error("Method not implemented.");
    }
    getPausesByFilters(filters: SubscriptionPauseQueryDto): Promise<SubscriptionPauseResponseDto[]> {
        throw new Error("Method not implemented.");
    }

    
}