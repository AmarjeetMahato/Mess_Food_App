import type { DbOrTx } from "@/config/database/database";
import { TOKENS } from "@/helper/user_and_auth/token";
import { inject, injectable } from "tsyringe";
import { IFeedbackRepository } from "./IFeedbackRepository";
import { Feedback, FeedbackRow } from "@/config/models";
import { CreateFeedbackDto, UpdateFeedbackDto } from "../dtos/feedbackDtos";
import { InternalServerError } from "@/globalError/AppError";
import { eq } from "drizzle-orm";


@injectable()
export class FeedbackRepository implements IFeedbackRepository {
    constructor(@inject(TOKENS.DB) private db: DbOrTx){}

    async getFeedbackByUserId(userId: string): Promise<FeedbackRow | null> {
         
         return await this.db.select()
                                   .from(Feedback)
                                   .where(eq(Feedback.user_id,userId))
                                   .then(rows => rows[0] || null)                           
    }

    async createFeedback(data: CreateFeedbackDto, userId:string): Promise<FeedbackRow> {
        const [row] = await this.db.insert(Feedback).values({
                    user_id: userId,
                    daily_menu_id: data.daily_menu_id,
                    menu_item_id: data.menu_item_id,
                    rating: data.rating,
                    comment: data.comment,
        }).returning();

        if (!row?.id) {
            throw new InternalServerError("Failed to create feedback");
        }
        return row;
    }

   async  getFeedbackById(id: string): Promise<FeedbackRow | null> {
         return  await this.db.select()
            .from(Feedback)
            .where(eq(Feedback.id,id))
            .then(rows => rows[0] || null);
    }


    async updateFeedback(id: string, data: UpdateFeedbackDto,userId:string): Promise<FeedbackRow> {
          const [updatedRow] = await this.db.update(Feedback)
                                         .set({...data, 
                                            user_id:userId,
                                            updated_at: new Date()})
                                         .where(eq(Feedback.id, id))
                                         .returning();

        if (!updatedRow?.id) {
            throw new InternalServerError("Failed to update feedback");
        }
        return updatedRow;
           
    }
    
    deleteFeedback(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

}