import { FeedbackRow } from "@/config/models";
import { FeedbackEntity } from "../entity/feedbackEntity";


export class FeedbacksMapper {
    static toEntity(dbRecord: FeedbackRow): FeedbackEntity {
        return new FeedbackEntity(
            dbRecord.id,
            dbRecord.user_id,
            dbRecord.daily_menu_id,
            dbRecord.menu_item_id,
            dbRecord.rating,
            dbRecord.comment,
            new Date(dbRecord.created_at),
            new Date(dbRecord.updated_at)
        );
    }

    static toResponseDto(entity: FeedbackEntity) {
        return {
            id: entity.id,
            user_id: entity.user_id,
            daily_menu_id: entity.daily_menu_id,
            menu_item_id: entity.menu_item_id,
            rating: entity.rating,
            comment: entity.comment,
            created_at: entity.created_at,
            updated_at: entity.updated_at, // Assuming updated_at is the same as created_at for now, adjust if needed
        };
    }
}