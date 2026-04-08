import { Request , Response, NextFunction } from "express";
import { TOKENS } from "@/helper/notifications/tokens";
import {injectable, inject}  from "tsyringe"
import type { INotificationService } from "../services/INotification.Service";
import { HTTPSTATUS } from "@/core/https.config";


@injectable()
export class NotificationController{
     constructor(@inject(TOKENS.NotificationService) private readonly service:INotificationService){}

     create_notification = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {
                               const userId = req.userId;
                        try {
                             const  resutl = await this.service.createNotification(req.body,userId!);
                             res.status(HTTPSTATUS.CREATED).json({
                                 message:"Notification created successfully",
                                 success:true,
                                 data:resutl
                             })
                        } catch (error) {
                            console.log(error);
                            next(error);  
                        }
     }


}