import { TOKENS } from "@/helper/subscriptions/tokens";
import {injectable, inject} from "tsyringe"
import type { IMealSkipService } from "../services/IMeal_Skip.Service";
import {Request, Response, NextFunction } from "express";
import { HTTPSTATUS } from "@/core/https.config";
import { mealSlotEnumZodDto } from "../dtos/Meal_SkipDtos";


@injectable()
export class MealSkipController{
    constructor(@inject(TOKENS.MealSkipService) private service: IMealSkipService){}

    create_mealSkip = async (req:Request, res:Response, next:NextFunction):Promise<void>=>{
                  try {
                        const result = await this.service.create_meal_skip(req.body);
                        res.status(HTTPSTATUS.CREATED).json({
                              message:"Meal skip created successfully",
                              success:true,
                              data:result
                        })
                  } catch (error) {
                     console.log(error);
                     next(error)
                     
                  }
    }

    update_mealSkip = async (req:Request, res:Response, next:NextFunction):Promise<void>=> {
            try {
                       const {id}  = req.params as {id:string};

                     const result = await this.service.update(id,req.body);
                        res.status(HTTPSTATUS.CREATED).json({
                              message:"Meal skip update successfully",
                              success:true,
                              data:result
                        })
            } catch (error) {
                    console.log(error);
                     next(error)
            }
    }

    getById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
                const { id } = req.params as { id: string };
                const result = await this.service.getById(id);

                 res.status(HTTPSTATUS.OK).json({
                        success: true,
                        message: "Meal skip fetched successfully",
                        data: result,
                 });
    } catch (error) {
      next(error);
    }
  };

    getByUserAndDateRange = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
      const { userId, startDate, endDate } = req.query as {
        userId: string;
        startDate: string;
        endDate: string;
      };

      const result = await this.service.getByUserAndDateRange(
        userId,
        new Date(startDate),
        new Date(endDate)
      );

      res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Meal skips fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

    getBySubscription = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
      const { subscriptionId } = req.params as { subscriptionId: string };
      const result = await this.service.getBySubscription(subscriptionId);

      res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Meal skips fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

    exists = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
      const { userId, skipDate, slot } = req.query as {
        userId: string;
        skipDate: string;
        slot: mealSlotEnumZodDto;
      };

      const result = await this.service.exists(userId, new Date(skipDate), slot);

      res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Meal skip existence checked successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

deleteById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
    try {
      const { id } = req.params as { id: string };
      await this.service.deleteById(id);

      res.status(HTTPSTATUS.OK).json({
        success: true,
        message: "Meal skip deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };


}