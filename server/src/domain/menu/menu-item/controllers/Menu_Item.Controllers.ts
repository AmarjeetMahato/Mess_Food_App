// src/modules/menu/menu-item.controller.ts

import { TOKENS } from "@/helper/menu/token";
import {Request, Response, NextFunction } from "express";
import { injectable, inject } from "tsyringe";
import { ListMenuItemsSchema, GetMenuItemSchema, CreateMenuItemSchema, UpdateMenuItemSchema } from "../dtos/MenuItemDtos";
import type { IMenuItemService } from "../services/IMenu_Item.Service";
import { HTTPSTATUS } from "@/core/https.config";


@injectable()
export class MenuItemController {

  constructor(
    @inject(TOKENS.MenuItemService) private readonly service: IMenuItemService,
  ) {}

  // GET /api/v1/menu/items
  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.getAll(req.params);
      res.status(HTTPSTATUS.OK).json({
             success:true,
             message:"Menu items fetched successfully",
             data:result
      })
    } catch (error) { next(error); }
  };

  // GET /api/v1/menu/items/:id
  getById = async ( req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as {id:string};
      const result = await this.service.getById(id);
      res.status(HTTPSTATUS.OK).json({
            success:true,
             message:"Menu item fetched successfully",
             data:result
      })
    } catch (error) { 
      console.log(error);
      next(error)
     }
  };

  // POST /api/v1/menu/items  (admin only)
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      
      const result = await this.service.create(req.body);
      res.status(201).json({
        success: true,
        data:    result,
        message: `Menu item '${result.name}' created successfully`,
      });
    } catch (error) { 
      console.log(error);
      next(error); }
  };

  // PATCH /api/v1/menu/items/:id  (admin only)
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = GetMenuItemSchema.parse(req.params);
      const dto    = UpdateMenuItemSchema.parse(req.body);
      const result = await this.service.update(id, dto);

      res.status(HTTPSTATUS.OK).json({
             success:true,
             message:"Menu item updated successfully",
             data: result
      })
    } catch (error) { next(error); }
  };

  // DELETE /api/v1/menu/items/:id  (admin only)
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params as {id:string};
      await this.service.delete(id);
      res.status(HTTPSTATUS.OK).json({
        success: true,
        message: 'Menu item removed successfully',
      });
    } catch (error) {
      console.log(error);
      
      next(error); }
  };
}