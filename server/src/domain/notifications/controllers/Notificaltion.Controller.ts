import { Request , Response, NextFunction } from "express";
import { TOKENS } from "@/helper/notifications/tokens";
import {injectable, inject}  from "tsyringe"
import type { INotificationService } from "../services/INotification.Service";
import { HTTPSTATUS } from "@/core/https.config";
import { notificationReferenceTypeZodEnumDto } from "../dtos/NotificationDtos";


@injectable()
export class NotificationController{
     constructor(@inject(TOKENS.NotificationService) private readonly service:INotificationService){}

     createBulk_notifications = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {
                
                        try {
                             const  result = await this.service.createBulkNotifications(req.body);
                             res.status(HTTPSTATUS.CREATED).json({
                                 message:"Notification created successfully",
                                 success:true,
                                 data:result
                             })
                        } catch (error) {
                            console.log(error);
                            next(error);  
                        }   
     }
     create_notification = async(req:Request, res:Response, next:NextFunction) :Promise<void> => {
                               const userId = req.userId;
                        try {
                             const  result = await this.service.createNotification(req.body,userId!);
                             res.status(HTTPSTATUS.CREATED).json({
                                 message:"Notification created successfully",
                                 success:true,
                                 data:result
                             })
                        } catch (error) {
                            console.log(error);
                            next(error);  
                        }
     }

     update_notification = async(req:Request, res:Response , next:NextFunction):Promise<void> => {
                       const {id} = req.params as {id:string};
                       const userId = req.userId;
                       try {
                             const result = await this.service.updateNotification(id,userId!, req.body);
                              res.status(HTTPSTATUS.CREATED).json({
                                 message:"Notification updated successfully",
                                 success:true,
                                 data:result
                             })
                       } catch (error) {
                            console.log(error);
                            next(error); 
                       }
     }

     
     fetch_notification_by_Id  = async(req:Request, res:Response , next:NextFunction):Promise<void> => {

                    const {id} = req.params as {id:string};

                    try {
                            const result = await  this.service.getNotificationById(id);
                               res.status(HTTPSTATUS.CREATED).json({
                                 message:"Notification fetch successfully",
                                 success:true,
                                 data:result
                             })
                    } catch (error) {
                        console.log(error);
                        next(error);       
                    }
     }


     fetch_notification_by_userId = async(req:Request, res:Response , next:NextFunction):Promise<void> => {
                   const userId = req.userId;
                   try {
                            const result = await  this.service.getNotificationsByUser(userId!,{
                                                      limit: Number(req.query.limit) || 20,
                                                       offset: Number(req.query.offset) || 0,
                                        });
                               res.status(HTTPSTATUS.CREATED).json({
                                 message:"Notification fetch successfully",
                                 success:true,
                                 data:result
                             })
                    } catch (error) {
                        console.log(error);
                        next(error);       
                    }
     }

getUnreadCount = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    const userId = req.userId;

    try {
      const count = await this.service.getUnreadCount(userId!);

      res.status(HTTPSTATUS.OK).json({
        message: "Unread count fetched successfully",
        success: true,
        data: { count },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

    markAllAsRead = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    const userId = req.userId;

    try {
      await this.service.markAllAsRead(userId!);

      res.status(HTTPSTATUS.OK).json({
        message: "All notifications marked as read",
        success: true,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

    markAsRead = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    const { id } = req.params as {id:string};

    try {
      const result = await this.service.markAsRead(id);

      res.status(HTTPSTATUS.OK).json({
        message: "Notification marked as read",
        success: true,
        data: result,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

 listNotifications = async (req: Request,res: Response, next: NextFunction): Promise<void> => {
  
     try {
          
          const {userId,status,type,channel,isRead,limit,offset} = req.query;

    const options: any = {};

    if (userId) options.userId = userId as string;
    if (status) options.status = status;
    if (type) options.type = type;
    if (channel) options.channel = channel;

    if (isRead !== undefined) {
      options.isRead = isRead === "true";
    }

    if (limit) options.limit = Number(limit);
    if (offset) options.offset = Number(offset);

    const result = await this.service.listNotifications(options);

    res.status(HTTPSTATUS.OK).json({
      message: "Notifications fetched successfully",
      success: true,
      data: result,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

  getNotificationsByReference = async (req: Request,res: Response,next: NextFunction): Promise<void> => {
    const { referenceId, referenceType } = req.params  as {referenceId :string, referenceType:notificationReferenceTypeZodEnumDto};

    try {
      const result = await this.service.getNotificationsByReference(
        referenceId,
        referenceType
      );

      res.status(HTTPSTATUS.OK).json({
        message: "Notifications fetched successfully",
        success: true,
        data: result,
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  };




}