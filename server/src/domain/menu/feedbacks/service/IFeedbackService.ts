import { CreateFeedbackDto, FeedbackResponseDto, UpdateFeedbackDto } from "../dtos/feedbackDtos";


export interface IFeedbackService {
    createFeedback(data: CreateFeedbackDto, userId:string): Promise<FeedbackResponseDto>;
    getFeedbackById(id: string): Promise<FeedbackResponseDto | null>;
    updateFeedback(id: string, data: UpdateFeedbackDto, userId:string): Promise<FeedbackResponseDto>;
    getFeedbackByUserid(userId:string):Promise<FeedbackResponseDto | null>
    deleteFeedback(id: string): Promise<void>;
}