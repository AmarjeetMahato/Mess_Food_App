import { Request, Response, NextFunction } from "express";
import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import { createSubscriptionPauseSchema, updateSubscriptionPauseSchema ,createSubscriptionPauseSchemaParams} from "../dtos/Subscription_PauesDtos";
import { HTTPSTATUS } from "@/core/https.config";
import type { ISubscriptionPauseService } from "../services/ISubscription_Pause.Service";
import { success } from "zod";


@injectable()
export class SubscriptionPauseController{
   constructor(@inject(TOKENS.SubscriptionPauseService) private readonly service: ISubscriptionPauseService){}

   createSubscriptionPause = async (req:Request, res:Response,  next:NextFunction):Promise<void> => {
                const payload  = createSubscriptionPauseSchema.safeParse(req.body);
                if(!payload.success){
                     const formateError = payload.error.issues.map((err)=>({
                              fields: err.path.join("."),
                              message: err.message
                     }))
                     res.status(HTTPSTATUS.BAD_REQUEST).json({
                          error:"Invalid request data",
                          success: false,
                          message:formateError
                     })
                     return
                }

                const userId = req.userId

                try {
                      const result = await this.service.pauseSubscription(payload.data!,userId!);
                      res.status(HTTPSTATUS.OK).json({
                           message:"Subscription Pause successfully",
                           success: true,
                           data:  result
                      })
                } catch (error) {
                    console.log(error);
                    next(error)  
                }
   }

  updatePause = async (req:Request, res:Response, next:NextFunction) :Promise<void> => {
                   const pauseId = createSubscriptionPauseSchemaParams.safeParse(req.params);
                   if(!pauseId.success){
                      
                     res.status(HTTPSTATUS.BAD_REQUEST).json({
                          error:"Invalid request params",
                          success: false,
                          message:pauseId.error.issues
                     })
                     return
                   }
                   const payload =  updateSubscriptionPauseSchema.safeParse(req.body);
                    if(!payload.success){
                     const formateError = payload.error.issues.map((err)=>({
                              fields: err.path.join("."),
                              message: err.message
                     }))
                     res.status(HTTPSTATUS.BAD_REQUEST).json({
                          error:"Invalid request data",
                          success: false,
                          message:formateError
                     })
                     return
                }

                const userId = req.userId as string

                try {
                       const result = await this.service.updatePause(pauseId.data.id, payload.data, userId!);
                       res.status(HTTPSTATUS.OK).json({
                           message:"Subscription Pause update successfully",
                           success: true,
                           data:  result
                       })
                } catch (error) {
                   console.log(error);
                   next(error)
                }
  } 


  getPausesByUserId = async ( req:Request, res:Response, next:NextFunction) :Promise<void> => {
                      const userId = req.userId;

                      try {
                             const result = await this.service.getPausesByUserId(userId!);
                             res.status(HTTPSTATUS.OK).json({
                                 message:"fetch pause by userId",
                                 success:true,
                                 data:result
                             })
                      } catch (error) {
                          console.log(error);
                          next(error)
                          
                      }
  }

getPausesBySubscriptionId = async(req:Request , res:Response, next:NextFunction):Promise<void> => {
                       const SubscriptionId  = createSubscriptionPauseSchemaParams.safeParse(req.params);
                          if(!SubscriptionId.success){
                      
                     res.status(HTTPSTATUS.BAD_REQUEST).json({
                          error:"Invalid request params",
                          success: false,
                          message:SubscriptionId.error.issues
                     })
                     return
                   }

                   try {
                          const result = await this.service.getPausesBySubscriptionId(SubscriptionId.data.id)
                           res.status(HTTPSTATUS.OK).json({
                                 message:"fetch pause by SubscriptionId",
                                 success:true,
                                 data:result
                             })
                   } catch (error) {
                        console.log(error);
                        next(error);
                        
                   }
} 

getActivePauseBySubscriptionId = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                      const SubscriptionId  = createSubscriptionPauseSchemaParams.safeParse(req.params);
                          if(!SubscriptionId.success){
                      
                     res.status(HTTPSTATUS.BAD_REQUEST).json({
                          error:"Invalid request params",
                          success: false,
                          message:SubscriptionId.error.issues
                     })
                     return
                   }

                   try {
                          const result = await this.service.getActivePauseBySubscriptionId(SubscriptionId.data.id)
                           res.status(HTTPSTATUS.OK).json({
                                 message:"fetch active pause by SubscriptionId",
                                 success:true,
                                 data:result
                             })
                   } catch (error) {
                        console.log(error);
                        next(error);
                        
                   }
}

getPauseById = async (req:Request, res:Response, next:NextFunction) :Promise<void> => {
                    const Id  = createSubscriptionPauseSchemaParams.safeParse(req.params);
                          if(!Id.success){
                      
                     res.status(HTTPSTATUS.BAD_REQUEST).json({
                          error:"Invalid request params",
                          success: false,
                          message:Id.error.issues
                     })
                     return
                   }

                   try {
                         const result = await this.service.getPauseById(Id.data.id);
                         res.status(HTTPSTATUS.OK).json({
                                message:"fetch pause by Subscription pause Id",
                                success:true,
                                data:result
                         })

                   } catch (error) {
                    
                   }
}
  

}