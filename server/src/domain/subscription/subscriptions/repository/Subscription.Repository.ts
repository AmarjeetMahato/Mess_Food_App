import type { DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import { inject, injectable } from "tsyringe";
import { ISubscriptionRepository } from "./ISubscription.Repository";
import { Subscription, SubscriptionRow } from "@/config/models";
import { SubscriptionEntity } from "../entity/SubscriptionEntity";
import { InternalServerError } from "@/globalError/AppError";
import { eq, lt, ne,and } from "drizzle-orm";
import { subscriptionStatusEnumSchemaDto } from "../dtos/subscriptionDtos";


@injectable()
export class SubscriptionRepository implements ISubscriptionRepository{
     constructor(@inject(TOKENS.DB) private db:DbOrTx){}
  

     async createSubscription(entity: SubscriptionEntity): Promise<SubscriptionRow> {
               const [row] = await this.db
                                        .insert(Subscription)
                                        .values({
                                                   user_id: entity.userId,
                                                   plan_type: entity.planType,
                                                   status: entity.status,
                                                   start_date: entity.startDate,
                                                   end_date: entity.endDate,
                                                   total_days: entity.totalDays,
                                                   consumed_days: entity.consumedDays,
                                                   remaining_days: entity.remainingDays,
                                                   has_breakfast: entity.hasBreakfast,
                                                   has_lunch: entity.hasLunch,
                                                   has_dinner: entity.hasDinner,
                                                   has_snacks: entity.hasSnacks,
                                                   auto_renew: entity.autoRenew,
                                                  })
                                        .returning();
               if(!row){
                     throw new InternalServerError("Failed to created Subscriptions")
               }                         
               return row;                         
     }
     
     async updateSubscription(id: string, entity: SubscriptionEntity): Promise<SubscriptionRow> {
               const [row] = await this.db.update(Subscription)
                                        .set({
                                              ...entity,
                                        })
                                        .where(eq(Subscription.id,id))
                                        .returning()
               if(!row){
                    throw new InternalServerError("Failed to update Subscription");   
               }                         
               
               return row
     }
     
     async getById(id: string): Promise<SubscriptionRow | null> {
          return await this.db.select().from(Subscription)
                                       .where(eq(Subscription.id,id))
                                       .then(row => row[0] || null)
     }

     async getActiveByUserId(userId: string): Promise<SubscriptionRow | null> {
            return await this.db.select()
                                .from(Subscription)
                                .where(eq(Subscription.user_id,userId))
                                .then(row => row[0] || null)
     }

     async getByUserId(userId: string): Promise<SubscriptionRow[]> {
            return await this.db.select().from(Subscription)
                                       .where(eq(Subscription.user_id,userId))
                                       
                                       
     }

     updateConsumption(id: string, consumedDays: number, remainingDays: number): Promise<SubscriptionRow> {
          throw new Error("Method not implemented.");
     }

     async updateStatus(id: string, status:subscriptionStatusEnumSchemaDto): Promise<SubscriptionRow> {
             const [row] =  await this.db.update(Subscription)
                                 .set({
                                      status:status,
                                      updated_at: new Date()
                                 })
                                 .where(eq(Subscription.id,id))
                                 .returning()
          if(!row){
                  throw new InternalServerError("Failed to  update Status")
          }    
          return row;
     }

     async getExpiredSubscriptions(currentDate: Date): Promise<SubscriptionRow[]> {
               
             const rows = await this.db
                                   .select()
                                   .from(Subscription)
                                   .where(
                                        and(
                                           lt(Subscription.end_date, currentDate), // end_date < currentDate
                                           ne(Subscription.status, "expired")      // status not yet marked as expired
                                         )
                                   );

               return rows;
     }
     
     getAutoRenewSubscriptions(): Promise<SubscriptionRow[]> {
          throw new Error("Method not implemented.");
     }


     async pauseSubscription(id: string): Promise<SubscriptionRow> {
              const [row] = await this.db
                              .update(Subscription)
                              .set({
                                         status: "paused",
                                         updated_at: new Date()
                                   })
                              .where(eq(Subscription.id, id))
                              .returning();
    if (!row) {
      throw new InternalServerError("Failed to pause subscription");
    }
    return row;
     }

     async resumeSubscription(id: string): Promise<SubscriptionRow> {
            const [row] = await this.db
                              .update(Subscription)
                              .set({
                                         status:"active",
                                         updated_at: new Date()
                                   })
                              .where(eq(Subscription.id, id))
                              .returning();
    if (!row) {
      throw new InternalServerError("Failed to pause subscription");
    }
    return row;
     }
 

     
}