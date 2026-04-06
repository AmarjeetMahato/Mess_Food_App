import { inject, injectable } from "tsyringe";
import { IMealSkipService } from "./IMeal_Skip.Service";
import { MealSkipCreateSchemaDto, MealSkipResponseSchemaDto, MealSkipUpdateSchemaDto, mealSlotEnumZodDto } from "../dtos/Meal_SkipDtos";
import { TOKENS } from "@/helper/subscriptions/tokens";
import type { IMealSkipRepository } from "../repository/IMeal_Skip.Repository";
import { BadRequestError, NotFoundError } from "@/globalError/AppError";
import { MealSkipMapper } from "../mapper/Meal_Skip.Mapper";

@injectable()
export class MealSkipService implements IMealSkipService{

     constructor(@inject(TOKENS.MealSkipRepository) private readonly mealSkipRepo:IMealSkipRepository){}
  

    async create_meal_skip(data: MealSkipCreateSchemaDto): Promise<MealSkipResponseSchemaDto> {
            if(!data){
                  throw new BadRequestError("Invalid fields values");
            }
             // 2️⃣ Check duplicate skip (business rule)
              const alreadyExists = await this.mealSkipRepo.exists(
                                 data.user_id,
                                 new Date(data.skip_date),
                                  data.slot
                          );
                // 3️⃣ Map DTO → Entity
              if (alreadyExists) {
                     throw new Error('Meal already skipped for this slot and date');
                }  

        const entity  = MealSkipMapper.toCreateEntity(data);
           // 4️⃣ Business Logic (example: wallet calculation)
    // You can plug pricing logic here
       if(entity.walletCreditAmount > 0){
          entity.isWalletCredited = false
       }  
         // 5️⃣ Save to DB
    const row = await this.mealSkipRepo.create_mealSkip(entity);
    // 6️⃣ Map → Entity → Response
    const savedEntity = MealSkipMapper.toEntity(row);

    return MealSkipMapper.toResponse(savedEntity);

    }
   async  update(id: string, data: MealSkipUpdateSchemaDto): Promise<MealSkipResponseSchemaDto> {
             if(!id){
                 throw new BadRequestError("Meal skip shouldn't be empty or null");
             } 
             if(!data){
                  throw new BadRequestError("Invalid fields values");
            }

                const existingRow = await this.mealSkipRepo.getById(id);
    if (!existingRow) {
      throw new Error('MealSkip not found');
    }

    const entity = MealSkipMapper.toEntity(existingRow);

    // 3️⃣ Apply updates (business-safe mutation)
    if (data.reason !== undefined) {
      entity.reason = data.reason;
    }
        if (data.wallet_credit_amount !== undefined) {
      if (entity.isWalletCredited) {
        throw new Error('Cannot modify wallet after credit');
      }
      entity.walletCreditAmount = data.wallet_credit_amount;
    }

    if (data.is_wallet_credited !== undefined) {
      if (entity.isWalletCredited) {
        throw new Error('Already credited');
      }
      entity.isWalletCredited = data.is_wallet_credited;
    }

    // 4️⃣ Persist
    const updatedRow = await this.mealSkipRepo.update_mealSkip(entity,id);

    // 5️⃣ Return response
    const updatedEntity = MealSkipMapper.toEntity(updatedRow);
    return MealSkipMapper.toResponse(updatedEntity);
    }

    async getById(id: string): Promise<MealSkipResponseSchemaDto | null> {
               if (!id) {
                    throw new BadRequestError('MealSkip ID is required');
                }

              const row = await this.mealSkipRepo.getById(id);
              if (!row){
                   throw new NotFoundError("MealSkip is not found")
              }
              const entity = MealSkipMapper.toEntity(row);
              return MealSkipMapper.toResponse(entity);
    }


    async getByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<MealSkipResponseSchemaDto[]> {
        
  if (!userId) throw new BadRequestError('User ID is required');
  if (!startDate || !endDate) {
    throw new BadRequestError('Start date and end date are required');
  }

  if (startDate > endDate) {
    throw new BadRequestError('Start date cannot be greater than end date');
  }
       const rows = await this.mealSkipRepo.getByUserAndDateRange(userId,startDate,endDate);
       if(!rows || rows.length ===0){
          return []
       }

       const entity = MealSkipMapper.toEntityArray(rows);
       return MealSkipMapper.toResponseDtoArray(entity);

    }


   async getBySubscription(subscriptionId: string): Promise<MealSkipResponseSchemaDto[]> {
         if (!subscriptionId) {
    throw new BadRequestError('Subscription ID is required');
  }

  const rows = await this.mealSkipRepo.getBySubscription(subscriptionId);
  if(!rows || rows.length === 0) {
         return []
  }

  const entity = MealSkipMapper.toEntityArray(rows);
  return MealSkipMapper.toResponseDtoArray(entity)

    }


    async exists(userId: string, skipDate: Date, slot: mealSlotEnumZodDto): Promise<boolean> {
          if (!userId) throw new BadRequestError('User ID is required');
  if (!skipDate) throw new BadRequestError('Skip date is required');
  if (!slot) throw new BadRequestError('Slot is required');

       return await this.mealSkipRepo.exists(userId, skipDate, slot);
    }


   async deleteById(id: string): Promise<void> {
          if (!id) {
    throw new BadRequestError('MealSkip ID is required');
  }

  const existing = await this.mealSkipRepo.getById(id);

  if (!existing) {
    throw new NotFoundError('MealSkip not found');
  }

  await this.mealSkipRepo.deleteById(id);
    }
}