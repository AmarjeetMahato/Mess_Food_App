import { Request, Response,NextFunction } from "express";
import { TOKENS } from "@/helper/menu/token";
import {inject, injectable} from "tsyringe"
import type { IMealPlanTemplateService } from "../services/IMealPlanTemplate.Service";
import { CreateMealPlanTemplateSchema, CreateMealPlanTemplateSchemaParams, UpdateMealPlanTemplateSchema } from "../dtos/MealPlanTemplate";
import { HTTPSTATUS } from "@/core/https.config";

@injectable()
export class MealPlanTemplateController{

    constructor(@inject(TOKENS.MealPlanTemplateService) private readonly mealPlanTemplateService: IMealPlanTemplateService){}

    createMealPlanTemplate = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
                 const payload = CreateMealPlanTemplateSchema.safeParse(req.body) ;
                 if(!payload.success){
                    const formattedErrors  = payload.error.issues.map((err)=>({
                             fields : err.path.join('.'),
                             message: err.message
                    }))
                 res.status(400).json({ 
                         error: "Invalid request data",
                         success: false,
                        details: formattedErrors });
                   return;     
                 }
                   const adminId = req.userId as string; // Assuming user ID is available in req.user
                 try {
                    const result = await this.mealPlanTemplateService.createMealTemplate(payload.data, adminId);
                    res.status(HTTPSTATUS.CREATED).json({
                            message:"Meal plan template created successfully",
                            success: true,
                            data: result
                    });
                 } catch (error) {
                    console.log(error); 
                    next(error);
                 }
    }

    fetchMealPlanTemplateById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
                      const parsedParams = CreateMealPlanTemplateSchemaParams.safeParse(req.params);
                      if(!parsedParams.success){
                         res.status(HTTPSTATUS.BAD_REQUEST).json({
                              error: "Invalid request parameters",
                              success: false,
                              details: parsedParams.error.issues
                         })
                      }

         try {
                      const result = await this.mealPlanTemplateService.findById(parsedParams.data?.id as string);
                      res.status(HTTPSTATUS.OK).json({
                          message: "Meal plan template fetched successfully",
                          success: true,
                          data: result
                      })
         } catch (error) {
              console.log(error);
              next(error);
              
         }
    }

    upateMealPlanTemplate = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
                        const parsedParams = CreateMealPlanTemplateSchemaParams.safeParse(req.params);
                        if(!parsedParams.success){
                            res.status(HTTPSTATUS.BAD_REQUEST).json({
                                error: "Invalid request parameters",
                                success: false,
                                details: parsedParams.error.issues
                            })
                            return;
                        }

                        const  payload = UpdateMealPlanTemplateSchema.safeParse(req.body);
                        if(!payload.success){
                            const formattedErrors  = payload.error.issues.map((err)=>({ 
                                fields : err.path.join('.'),
                                message: err.message
                            })) 
                            res.status(HTTPSTATUS.BAD_REQUEST).json({
                                error: "Invalid request data",
                                success: false,
                                details: formattedErrors
                            })
                            return;
                        }

                        try {
                              const result = await this.mealPlanTemplateService.updateMealTemplate(
                                parsedParams.data?.id as string,
                                payload?.data,
                                req.userId as string // Assuming user ID is available in req.user
                              )
                              res.status(HTTPSTATUS.OK).json({
                                message: "Meal plan template updated successfully",
                                success: true,
                                data: result
                              })
                        } catch (error) {
                            console.log(error);
                            next(error);
                            
                        }
    }

    deleteMealPlanTemplate = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
                        const parsedParams = CreateMealPlanTemplateSchemaParams.safeParse(req.params);
                        if(!parsedParams.success){
                            res.status(HTTPSTATUS.BAD_REQUEST).json({
                                error: "Invalid request parameters",
                                success: false,
                                details: parsedParams.error.issues
                            })
                            return;
                        }
                        try {
                            const result = await this.mealPlanTemplateService.deleteMealTemplate(parsedParams.data?.id as string);
                            res.status(HTTPSTATUS.OK).json({
                                message: "Meal plan template deleted successfully",
                                success: true,
                                data: result
                            })
                        } catch (error) {
                            console.log(error);
                            next(error);
                        }
    }

}