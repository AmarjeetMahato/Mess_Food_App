import { TOKENS } from "@/helper/menu/token";
import { inject, injectable } from "tsyringe";
import type { IFeedbackService } from "../service/IFeedbackService";
import {Request, Response, NextFunction } from "express";
import { CreateFeedbackSchema, FeedbackParamsSchema, UpdateFeedbackSchema } from "../dtos/feedbackDtos";
import { HTTPSTATUS } from "@/core/https.config";


@injectable()
export class FeedbackController {
    constructor(@inject(TOKENS.FeedbackService) private readonly feedbackService: IFeedbackService){}

    create_feedback = async ( req:Request,res:Response, next:NextFunction):Promise<void> =>{
               const payload = CreateFeedbackSchema.safeParse(req.body);
               if(!payload.success){
                     const formattedErrors  = payload.error.issues.map((err)=>({
                          fields: err.path.join("."),
                          message: err.message
                     }))
                     res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid request data",
                        success: false,
                        details: formattedErrors}
                     )
               }
               const userId = req.userId;
               try {
                       const result = await this.feedbackService.createFeedback(payload.data!,userId as string);
                       res.status(HTTPSTATUS.CREATED).json({
                             message:"Feedback created successfully",
                             success:true,
                             data:result
                       })
               } catch (error) {
                    console.log(error);
                    next(error)
                    
               }
    }

    update_feedback = async( req:Request,res:Response, next:NextFunction):Promise<void> =>{
             const feedId = FeedbackParamsSchema.safeParse(req.params)
             if(!feedId.success){
                     res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid params Id",
                        success: false,
                        details: feedId.error.issues
                    })
             }
             const payload = UpdateFeedbackSchema.safeParse(req.body);
             if(!payload.success){
                 const formattedErrors  = payload.error.issues.map((err)=>({
                          fields: err.path.join("."),
                          message: err.message
                     }))
                     res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid request data",
                        success: false,
                        details: formattedErrors}
                     )
             }
               const userId = req.userId as string
             try {
                    const result = await this.feedbackService.updateFeedback(feedId.data?.id!,payload.data!,userId)
                    res.status(HTTPSTATUS.OK).json({
                          message:"Feedback update successfully",
                          success:true,
                          data:result
                    })
             } catch (error) {
                   console.log(error);
                   next(error);
                   
             }
    }

    fetch_by_id= async( req:Request,res:Response, next:NextFunction):Promise<void> => {
                     const feedId = FeedbackParamsSchema.safeParse(req.params);
                     if(!feedId.success){
                          res.status(HTTPSTATUS.BAD_REQUEST).json({
                        error: "Invalid params Id",
                        success: false,
                        details: feedId.error.issues
                          })
                     }

                     try {
                          const result = await this.feedbackService.getFeedbackById(feedId.data?.id!)
                          res.status(HTTPSTATUS.OK).json({
                            message:"Feedback fetch successfully",
                            success:true,
                            data:result
                          })
                     } catch (error) {
                         console.log(error);
                         next(error);
                         
                     }
    }

    fetch_by_userId = async( req:Request,res:Response, next:NextFunction):Promise<void> => {
              
                const userId = req.userId as string;
                try {
                       const result = await this.feedbackService.getFeedbackByUserid(userId)
                       res.status(HTTPSTATUS.OK).json({
                            message:"Feedback fetch successfully",
                            success:true,
                            data:result
                       })
                } catch (error) {
                     console.log(error);
                     next(error)
                     
                }
    }

}