import { NextFunction, Request, Response } from "express";
import { TOKENS } from "@/helper/menu/token";
import { inject, injectable } from "tsyringe";
import type { IMenuItemMappingService } from "../services/IMenuItemMappingService";
import { CreateMenuItemMappingSchema, MenuItemMappingParamsSchemaParams, UpdateMenuItemMappingSchema } from "../dtos/menu-item-mapping";
import { HTTPSTATUS } from "@/core/https.config";
import { success } from "zod";


@injectable()
export class MenuItemMappingController {
    constructor(@inject(TOKENS.MenuItemMappingService) private readonly menuItemMappingService:IMenuItemMappingService){}

    createMenuItemMapping = async (req: Request, res: Response, next: NextFunction):Promise<void> => {

              
                try {
                       const result = await this.menuItemMappingService.createMenuItemMapping(req.body);
                       res.status(HTTPSTATUS.CREATED).json({
                            message: "Menu item mapping created successfully",
                            success: true,
                            data: result
                       });
                } catch (error) {
                    console.log(error);
                    next(error);
                }

    }

    updateMenuItemMapping = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
                    const params = MenuItemMappingParamsSchemaParams.safeParse(req.params);
                    if(!params.success){
                    
                         res.status(HTTPSTATUS.BAD_REQUEST).json({
                            error: "Invalid request parameters",
                            success: false,
                            details:params.error.issues
                         });
                         return;  
                    }  

                    const payload =  UpdateMenuItemMappingSchema.safeParse(req.body);
                    if(!payload.success){
                         const formattedErrors = payload.error.issues.map((err) => ({
                            field: err.path.join('.'),
                            message: err.message
                         }));
                         res.status(HTTPSTATUS.BAD_REQUEST).json({
                            error: "Invalid request data",
                            success: false,
                            details: formattedErrors
                         });
                         return;
                    }

                    try {
                           const result = await this.menuItemMappingService.updateMenuItemMapping(params.data.id, payload.data);
                           res.status(HTTPSTATUS.OK).json({
                                message: "Menu item mapping updated successfully",
                                success: true,
                                data: result
                           });
                    } catch (error) {
                         console.log(error);
                         next(error);
                          
                    }

                }

    fetchMenuItemMappingById = async (req: Request, res: Response, next: NextFunction):Promise<void> => {
                    const params = MenuItemMappingParamsSchemaParams.safeParse(req.params);
                    if(!params.success){
                         res.status(HTTPSTATUS.BAD_REQUEST).json({
                            error: "Invalid request parameters",
                            success: false,
                            details: params.error.issues
                         });
                         return;
                    }

                    try {
                            const result = await this.menuItemMappingService.findById(params.data.id);
                            res.status(HTTPSTATUS.OK).json({
                                 message: "Menu item mapping fetched successfully",
                                 success: true,
                                 data: result
                            });
                    } catch (error) {
                          console.log(error);
                          next(error);
                    }
    } 

  fetchAll = async (req: Request,res: Response,next: NextFunction): Promise<void> => {

  const limit = Number(req.query.limit) || 10;
  const page = Number(req.query.page) || 1;

  try {
    const result = await this.menuItemMappingService.findAllMenuItemMappings(
      limit,
      page
    );

    res.status(HTTPSTATUS.OK).json({
      message: "MenuItemMappings fetched successfully",
      success: true,
      data: result,
    });

  } catch (error) {
    console.log(error);
    next(error);
  }
};

    deleteMenuItemMapping = async (req:Request, res:Response, next:NextFunction):Promise<void> => {
           const {id} = req.params as {id:string};
            try {
                  const result = await this.menuItemMappingService.deleteMenuItemMapping(id);
                  res.status(HTTPSTATUS.OK).json({
                      message:"MenuItemMapping deleted successfully",
                      success:true,
                      data:result
                  })
            } catch (error) {
                console.log(error);
                next(error);
                
            }
    }
    
    
}