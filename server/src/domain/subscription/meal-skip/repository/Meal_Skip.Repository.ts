import type { DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import {injectable, inject} from "tsyringe"
import { IMealSkipRepository } from "./IMeal_Skip.Repository";
import { MealSkip, MealSkipRow } from "@/config/models";
import { MealSkipEntity } from "../entity/meal_Skip.Entity";
import { MealSkipMapper } from "../mapper/Meal_Skip.Mapper";
import { InternalServerError } from "@/globalError/AppError";
import { eq, and, gte, lte, count } from "drizzle-orm";
import { mealSlotEnumZodDto } from "../dtos/Meal_SkipDtos";


@injectable()
export class MealSkipRepository  implements IMealSkipRepository{
    constructor(@inject(TOKENS.DB) private db:DbOrTx){}


    async create_mealSkip(entity: MealSkipEntity): Promise<MealSkipRow> {
          const payload = MealSkipMapper.toPersistence(entity);
          const [row] = await this.db.insert(MealSkip)
                                      .values(payload)
                                      .returning()
          if(!row){
              throw new InternalServerError("Failed to created meal skip")
          }
          
          return row;
    }


   async update_mealSkip(entity: MealSkipEntity,id:string): Promise<MealSkipRow> {
        const payload = MealSkipMapper.toPersistence(entity);
        const [row] = await this.db.update(MealSkip)
                                   .set({
                                       ...payload,
                                       updated_at: new Date()
                                   })
                                   .where(eq(MealSkip.id, id))
                                   .returning()
          if(!row){
              throw new InternalServerError("Failed to update meal skip")
          }
          
          return row;                           
    }

   async  getById(id: string): Promise<MealSkipRow | null> {
         return  await this.db.select()
                              .from(MealSkip)
                              .where(eq(MealSkip.id, id))
                              .then(row => row[0] || null);
    }

      async getByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<MealSkipRow[]> {
                     return await this.db.select()
                                         .from(MealSkip)
                                         .where(
                                 and(
                                     eq(MealSkip.user_id, userId),
                                     gte(MealSkip.skip_date, startDate),
                                     lte(MealSkip.skip_date, endDate)
                                    )
                            );
  }
    async getBySubscription(subscriptionId: string): Promise<MealSkipRow[]> {
              return await this.db.select()
                                  .from(MealSkip)
                                  .where(eq(MealSkip.subscription_id, subscriptionId)); 
    }

   async exists(userId: string, skipDate: Date, slot:mealSlotEnumZodDto): Promise<boolean> {
               const result = await this.db.select({ value: count() })
                                       .from(MealSkip)
                                       .where(
                                             and(
                                                 eq(MealSkip.user_id, userId),
                                                 eq(MealSkip.skip_date, skipDate),
                                                 eq(MealSkip.slot, slot)
                                                )
                                        );

               return Number(result[0]?.value ?? 0) > 0;
    }
    
   async  deleteById(id: string): Promise<void> {
               await this.db.delete(MealSkip)
                            .where(eq(MealSkip.id, id));
    }

}