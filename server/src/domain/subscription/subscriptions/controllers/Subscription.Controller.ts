import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import type { ISubscriptionService } from "../services/ISubscription.Service";
import { NextFunction, Request,Response } from "express";
import { HTTPSTATUS } from "@/core/https.config";


@injectable()
export class SubscriptionController{
    constructor(@inject(TOKENS.SubscriptionService) private readonly service: ISubscriptionService){}


    createSubscription = async (req:Request, res:Response, next:NextFunction):Promise<void>=> {
             const userId = req.userId;
             try {
                    const result = await this.service.createSubscription(req.body!, userId!);
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
                   const {id} = req.params as {id:string};
                  const userId = req.userId;

                 try {
                       const result = await this.service.updateSubscription(id!,req.body!, userId!)
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
                  const {id} = req.params as {id:string}
                  try {
                          const result = await this.service.getSubscriptionById(id);
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

                    const {id} = req.params as {id:string};
                  try {
                        const result = await this.service.pauseSubscription(id);
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

                  const {id} = req.params as {id:string};
                  try {
                        const result = await this.service.resumeSubscription(id);
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

                  const {id} = req.params as {id:string};
                  try {
                        const result = await this.service.cancelSubscription(id);
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