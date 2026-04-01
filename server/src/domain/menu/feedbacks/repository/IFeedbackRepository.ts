import { FeedbackRow } from "@/config/models";
import { CreateFeedbackDto, UpdateFeedbackDto } from "../dtos/feedbackDtos";

export interface IFeedbackRepository {
  createFeedback(data: CreateFeedbackDto, userId:string): Promise<FeedbackRow>;
  getFeedbackById(id: string): Promise<FeedbackRow | null>;
  updateFeedback(id: string, data: UpdateFeedbackDto, userId:string): Promise<FeedbackRow>;
  deleteFeedback(id: string): Promise<void>;
  getFeedbackByUserId(userId:string):Promise<FeedbackRow | null>

}