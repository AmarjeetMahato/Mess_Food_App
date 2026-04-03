import {injectable, inject} from "tsyringe"
import { ISubscriptionPauseRepository } from "./ISubscription_Pause.Repository";
import { Subscription, SubscriptionPause, SubscriptionPauseRow } from "@/config/models";
import { SubscriptionPauseEntity } from "../entity/Subscription_Pause.Entity";
import { TOKENS } from "@/helper/user_and_auth/token";
import type { DbOrTx } from "@/config/database/database";
import { InternalServerError } from "@/globalError/AppError";
import { eq ,and, gte, lte} from "drizzle-orm";


@injectable()
export class SubscriptionPauserRepository  implements ISubscriptionPauseRepository{
    constructor(@inject(TOKENS.DB) private db:DbOrTx){}

    async  createPause(data: SubscriptionPauseEntity): Promise<SubscriptionPauseRow> {
         const [row] = await this.db.insert(SubscriptionPause)
             .values({
              subscription_id: data.subscriptionId,
              paused_by: data.pausedBy ?? null,
              pause_start: data.pauseStart,
              pause_end: data.pauseEnd ?? null,
              reason: data.reason ?? null,
              is_resumed: data.isResumed,          // default false
              resumed_at: data.resumedAt ?? null,
              days_paused: data.daysPaused ?? null,
    }).returning();

         if(!row){
              throw new InternalServerError("Failed to pause Subscription")
         }
         return row;                       
    }

   async  resumePause(id: string, data: Partial<SubscriptionPauseEntity>): Promise<SubscriptionPauseRow> {
         const [row] = await this.db
                                    .update(SubscriptionPause)
                                    .set({
                                         is_resumed: true, // always true when resuming

                                         pause_end: data.pauseEnd ?? new Date(), // fallback safety
                                         resumed_at: data.resumedAt ?? new Date(),

                                         days_paused: data.daysPaused ?? null,
                                        })
                                        .where(eq(SubscriptionPause.id, id))
                                        .returning();

         if (!row) {
            throw new InternalServerError("Failed to resume subscription pause");
            }

        return row;                           
    }
    // ─────────────────────────────────────────────
  // ✅ Get by ID
  // ─────────────────────────────────────────────
  async getById(id: string): Promise<SubscriptionPauseRow | null> {
    const rows = await this.db
                           .select()
                           .from(SubscriptionPause)
                           .where(eq(SubscriptionPause.id, id))
                           .limit(1);

    return rows[0] || null;
  }

  // ─────────────────────────────────────────────
  // ✅ Get all by Subscription ID
  // ─────────────────────────────────────────────
  async getBySubscriptionId(subscriptionId: string): Promise<SubscriptionPauseRow[]> {

    return await this.db
      .select()
      .from(SubscriptionPause)
      .where(eq(SubscriptionPause.subscription_id, subscriptionId));
  }

  // ─────────────────────────────────────────────
  // ✅ Get Active Pause (VERY IMPORTANT)
  // ─────────────────────────────────────────────
  async getActivePauseBySubscriptionId(
    subscriptionId: string
  ): Promise<SubscriptionPauseRow | null> {

    const rows = await this.db
      .select()
      .from(SubscriptionPause)
      .where(
        and(
          eq(SubscriptionPause.subscription_id, subscriptionId),
          eq(SubscriptionPause.is_resumed, false)
        )
      )
      .limit(1);

    return rows[0] || null;
  }

  // ─────────────────────────────────────────────
  // ✅ Update Pause
  // ─────────────────────────────────────────────
  async updatePause(
    id: string,
    data: Partial<SubscriptionPauseEntity>
  ): Promise<SubscriptionPauseRow> {

    const [row] = await this.db
      .update(SubscriptionPause)
      .set({
        pause_end: data.pauseEnd ?? undefined,
        reason: data.reason ?? undefined,
        is_resumed: data.isResumed ?? undefined,
        resumed_at: data.resumedAt ?? undefined,
        days_paused: data.daysPaused ?? undefined,
      })
      .where(eq(SubscriptionPause.id, id))
      .returning();

    if (!row) {
      throw new InternalServerError("Failed to update subscription pause");
    }

    return row;
  }

  // ─────────────────────────────────────────────
  // ✅ Get by User ID
  // (join via subscription)
  // ─────────────────────────────────────────────
  async getByUserId(userId: string): Promise<SubscriptionPauseRow[]> {

    const rows =  await this.db
      .select({
         pause: SubscriptionPause
      })
      .from(SubscriptionPause)
      .innerJoin(
        Subscription,
        eq(SubscriptionPause.subscription_id, Subscription.id)
      )
      .where(eq(Subscription.user_id, userId));

      return rows.map(r => r.pause); // ✅ extract actual data
  }

  // ─────────────────────────────────────────────
  // ✅ Filter Query (Dynamic)
  // ─────────────────────────────────────────────
  async getByFilters(filters: {
    subscriptionId?: string;
    isResumed?: boolean;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<SubscriptionPauseRow[]> {

    const conditions = [];

    if (filters.subscriptionId) {
      conditions.push(eq(SubscriptionPause.subscription_id, filters.subscriptionId));
    }

    if (filters.isResumed !== undefined) {
      conditions.push(eq(SubscriptionPause.is_resumed, filters.isResumed));
    }

    if (filters.fromDate) {
      conditions.push(gte(SubscriptionPause.pause_start, filters.fromDate));
    }

    if (filters.toDate) {
      conditions.push(lte(SubscriptionPause.pause_start, filters.toDate));
    }

    return await this.db
      .select()
      .from(SubscriptionPause)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
  }
}