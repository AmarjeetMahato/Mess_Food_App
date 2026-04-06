import { Request, Response, NextFunction } from "express";
import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import { HTTPSTATUS } from "@/core/https.config";
import type { ISubscriptionPauseService } from "../services/ISubscription_Pause.Service";
import { success } from "zod";


@injectable()
export class SubscriptionPauseController{
   constructor(@inject(TOKENS.SubscriptionPauseService) private readonly service: ISubscriptionPauseService){}

   createSubscriptionPause = async (req:Request, res:Response,  next:NextFunction):Promise<void> => {
                const userId = req.userId
                try {
                      const result = await this.service.pauseSubscription(req.body,userId!);
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
              
                const userId = req.userId as string
                const {id} = req.params as {id:string};
                try {
                       const result = await this.service.updatePause(id,req.body, userId!);
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
                        const {id} = req.params as {id:string};
                   try {
                          const result = await this.service.getPausesBySubscriptionId(id!)
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
                     const {id} = req.params as {id:string};
                   try {
                          const result = await this.service.getActivePauseBySubscriptionId(id)
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
                    const {id} = req.params as {id:string};
                   try {
                         const result = await this.service.getPauseById(id);
                         res.status(HTTPSTATUS.OK).json({
                                message:"fetch pause by Subscription pause Id",
                                success:true,
                                data:result
                         })

                   } catch (error) {
                    
                   }
}
  

}