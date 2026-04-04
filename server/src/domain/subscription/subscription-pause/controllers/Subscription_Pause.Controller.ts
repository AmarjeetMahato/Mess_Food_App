import { Request, Response, NextFunction } from "express";
import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import { createSubscriptionPauseSchema, updateSubscriptionPauseSchema ,createSubscriptionPauseSchemaParams} from "../dtos/Subscription_PauesDtos";
import { HTTPSTATUS } from "@/core/https.config";
import type { ISubscriptionPauseService } from "../services/ISubscription_Pause.Service";


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
}