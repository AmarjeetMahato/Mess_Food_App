import { inject } from "tsyringe";
import { CreateFeedbackDto, FeedbackResponseDto, UpdateFeedbackDto } from "../dtos/feedbackDtos";
import { IFeedbackService } from "./IFeedbackService";
import { TOKENS } from "@/helper/menu/token";
import type { IFeedbackRepository } from "../repository/IFeedbackRepository";
import { FeedbacksMapper } from "../mapper/feedbacksMapper";
import { BadRequestError, InternalServerError, NotFoundError } from "@/globalError/AppError";


export class FeedbackService implements IFeedbackService {
    constructor(@inject(TOKENS.FeedbackRepository) private readonly feedbackRepository:IFeedbackRepository){}
    


   async createFeedback(data: CreateFeedbackDto, userId:string): Promise<FeedbackResponseDto> {
          if(!userId){
                throw new BadRequestError("UserId is required");      
          }
          const feedbackRow = await this.feedbackRepository.createFeedback(data, userId);
          if(!feedbackRow || !feedbackRow.id){
               throw new InternalServerError("Failed to create feedback")  
          }
          const entity = FeedbacksMapper.toEntity(feedbackRow);
          return FeedbacksMapper.toResponseDto(entity);
    }
   
     async getFeedbackByUserid(userId: string): Promise<FeedbackResponseDto | null> {
            if(!userId){
               throw new BadRequestError("UserId ID is required");
          }

          const feedbackRow = await this.feedbackRepository.getFeedbackByUserId(userId);
          if(!feedbackRow){
                throw new NotFoundError("Feedback not found");
          }
          const entity = FeedbacksMapper.toEntity(feedbackRow);
          return FeedbacksMapper.toResponseDto(entity);
      }

    async getFeedbackById(id: string): Promise<FeedbackResponseDto | null> {
          if(!id){
               throw new BadRequestError("Feedback ID is required");
          }

          const feedbackRow = await this.feedbackRepository.getFeedbackById(id);
          if(!feedbackRow){
                throw new NotFoundError("Feedback not found");
          }
          const entity = FeedbacksMapper.toEntity(feedbackRow);
          return FeedbacksMapper.toResponseDto(entity);
    }


    async updateFeedback(id: string, data: UpdateFeedbackDto, userId:string): Promise<FeedbackResponseDto> {
             if(!id){
                throw new BadRequestError("Feedback ID is required for update");
             }  
             
             const updatedRow = await this.feedbackRepository.updateFeedback(id, data, userId);
             if(!updatedRow || !updatedRow.id){
                   throw new InternalServerError("Failed to update Feedback");  
             }
            
             const entity = FeedbacksMapper.toEntity(updatedRow);
             return FeedbacksMapper.toResponseDto(entity);

            }


    deleteFeedback(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}