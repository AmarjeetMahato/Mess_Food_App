import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import type { ISubscriptionService } from "../services/ISubscription.Service";
import { NextFunction, Request,Response } from "express";
import { createSubscriptionParamsSchema, createSubscriptionSchema, updateSubscriptionSchema } from "../dtos/subscriptionDtos";
import { HTTPSTATUS } from "@/core/https.config";


@injectable()
export class SubscriptionController{
    constructor(@inject(TOKENS.SubscriptionService) private readonly service: ISubscriptionService){}


    createSubscription = async (req:Request, res:Response, next:NextFunction):Promise<void>=> {
             const payload = createSubscriptionSchema.safeParse(req.body);
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
                    const result = await this.service.createSubscription(payload.data!, userId!);
                    res.status(HTTPSTATUS.CREATED).json({
                             message:"Subscription created successfully",
                             success:true,
                             data:result
                    })
             } catch (error) {
                 console.log(error);
                 next(error)
             }
    }

    updateSubscription = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                  const subId = createSubscriptionParamsSchema.safeParse(req.params)
                  if(!subId.success){
                        res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid request data",
                          success: false,
                         details: subId.error.issues
                        }
                        )    
                        return;
                  }
                  
                  const payload = updateSubscriptionSchema.safeParse(req.body);
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
                       const result = await this.service.updateSubscription(subId.data.id!, payload.data!, userId!)
                        res.status(HTTPSTATUS.CREATED).json({
                             message:"Subscription created successfully",
                             success:true,
                             data:result
                    })
                 } catch (error) {
                     console.log(error);
                     next(error)                     
                 } 
    }

    getSubscriptionById = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                           const subId = createSubscriptionParamsSchema.safeParse(req.params)
                  if(!subId.success){
                        res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid request data",
                          success: false,
                         details: subId.error.issues
                        }
                        )    
                        return;
                  }

                  try {
                          const result = await this.service.getSubscriptionById(subId.data.id);
                          res.status(HTTPSTATUS.OK).json({
                             message:"Subscription fetch successfully",
                             success:true,
                             data:result
                          })
                  } catch (error) {
                       console.log(error);
                       next(error)
                       
                  }
    }

    getActiveSubscriptionByUserId = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {
                           const userId = req.userId;

                           try {
                                 const result = await this.service.getActiveSubscriptionByUserId(userId!)
                                 res.status(HTTPSTATUS.OK).json({
                                     message:"Subscription fetch successfully",
                                     success:true,
                                     data:result
                                 })
                           } catch (error) {
                               console.log(error);
                               next(error);
                               
                           }
    }

    getSubscriptionsByUserId = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {
                          const userId = req.userId;
                        try {
                               const result = await this.service.getSubscriptionsByUserId(userId!)
                                res.status(HTTPSTATUS.OK).json({
                                     message:"Subscription fetch successfully",
                                     success:true,
                                     data:result
                                 })
                        } catch (error) {
                             console.log(error);
                             next(error);
                             
                        }
    }

    pauseSubscription = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {

                  const subId = createSubscriptionParamsSchema.safeParse(req.params)
                  if(!subId.success){
                        res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid pause data",
                          success: false,
                         details: subId.error.issues
                        }
                        )    
                        return;
                  }
                  
                  try {
                        const result = await this.service.pauseSubscription(subId.data.id);
                             res.status(HTTPSTATUS.OK).json({
                                     message:"Subscription fetch successfully",
                                     success:true,
                                     data:result
                                 })
                  } catch (error) {
                       console.log(error);
                       next(error);
                       
                  }
    } 


    resumeSubscription = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {

                  const subId = createSubscriptionParamsSchema.safeParse(req.params)
                  if(!subId.success){
                        res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid request data",
                          success: false,
                         details: subId.error.issues
                        }
                        )    
                        return;
                  }
                  
                  try {
                        const result = await this.service.resumeSubscription(subId.data.id);
                             res.status(HTTPSTATUS.OK).json({
                                     message:"Subscription resume successfully",
                                     success:true,
                                     data:result
                                 })
                  } catch (error) {
                       console.log(error);
                       next(error);
                       
                  }
    }

    cancelSubscription = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {

                  const subId = createSubscriptionParamsSchema.safeParse(req.params)
                  if(!subId.success){
                        res.status(HTTPSTATUS.BAD_REQUEST).json(
                        {error: "Invalid request data",
                          success: false,
                         details: subId.error.issues
                        }
                        )    
                        return;
                  }
                  
                  try {
                        const result = await this.service.cancelSubscription(subId.data.id);
                             res.status(HTTPSTATUS.OK).json({
                                     message:"Subscription cancel successfully",
                                     success:true,
                                     data:result
                                 })
                  } catch (error) {
                       console.log(error);
                       next(error);
                       
                  }
    }







    


}