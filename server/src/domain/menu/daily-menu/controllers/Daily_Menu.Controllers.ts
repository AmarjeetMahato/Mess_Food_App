import { Request, Response, NextFunction } from "express";
import { TOKENS } from "@/helper/menu/token";
import { inject, injectable } from "tsyringe";
import {type IDailyMenuService } from "../services/IDailyService";
import { CreateDailyMenuSchema, UpdateDailyMenuSchema } from "../dtos/DailyMenuDtos";

@injectable()
export class DailyMenuController{

    constructor(@inject(TOKENS.DailyMenuService) private dailyMenuService:IDailyMenuService){};


    createDailyMenu = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                  
                 const  payload = CreateDailyMenuSchema.safeParse(req.body);
                 if(!payload.success){
                     res.status(400).json({ 
                        message:"Invalid request data",
                        success: false,
                      });
                     return;
                 }

                 const adminId = req.userId; // Assuming user ID is available in req.user
             try {
                     const createDailyMenu = await this.dailyMenuService.create(payload.data, adminId!);
                     res.status(201).json({
                        message: "Daily menu created successfully",
                        success: true,
                        data: createDailyMenu,
                     });
             } catch (error) {
                console.log(error);
                next(error);   
             }
    }

    updateDailyMenu = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                const payload = UpdateDailyMenuSchema.safeParse(req.body);
                if(!payload.success){
                    res.status(400).json({ 
                       message:"Invalid request data",
                       success: false,
                     });
                    return;
                }
                  const adminId = req.userId; // Assuming user ID is available in req.user
                  const { id } = req.params;
                  if(id !== typeof "string"){
                    res.status(400).json({ 
                        message:"Invalid ID parameter",
                        success: false,
                        });
                    return;
                }

                try {
                       const updateDailyMenu = await this.dailyMenuService.update(id, payload.data, adminId!);
                          res.status(200).json({
                            message: "Daily menu updated successfully",
                            success: true,
                            data: updateDailyMenu,
                          });
                } catch (error)  {
                       console.log(error);
                          next(error);  
                }
    }

    deactiveteDailyMenu = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                const adminId = req.userId; // Assuming user ID is available in req.user
                const { id } = req.params;
                if(id !== typeof "string"){
                    res.status(400).json({ 
                        message:"Invalid ID parameter",
                        success: false,
                        });
                    return;
                }
                try {
                       const deactivatedMenu = await this.dailyMenuService.deactivate(id, adminId!);
                       res.status(200).json({
                        message: "Daily menu deactivated successfully",
                        success: true,
                        data: deactivatedMenu,
                       });
                } catch (error) {
                     console.log(error);
                     next(error);  
                }
    }

    activeteDailyMenu = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                const adminId = req.userId; // Assuming user ID is available in req.user
                const { id } = req.params;
                if(id !== typeof "string"){
                    res.status(400).json({ 
                        message:"Invalid ID parameter",
                        success: false,
                        });
                    return;
                }
                try {
                       const activatedMenu = await this.dailyMenuService.deactivate(id, adminId!);
                       res.status(200).json({
                        message: "Daily menu activated successfully",
                        success: true,
                        data: activatedMenu,
                       });
                } catch (error) {
                     console.log(error);
                     next(error);  
                }
    }

    deleteDailyMenu = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
                const { id } = req.params;
                if(id !== typeof "string"){
                    res.status(400).json({ 
                        message:"Invalid ID parameter",
                        success: false,
                        });
                    return;
                }
                try {
                       const deletedMenu = await this.dailyMenuService.deleteDailyMenu(id);
                       res.status(200).json({
                        message: "Daily menu deleted successfully",
                        success: true,
                        data: deletedMenu,
                       });
                } catch (error) {
                     console.log(error);
                     next(error);  
                }

    }

}