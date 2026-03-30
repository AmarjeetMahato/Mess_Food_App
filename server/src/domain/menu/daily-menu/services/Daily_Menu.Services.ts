import { injectable, inject } from "tsyringe";
import { IDailyMenuService } from "./IDailyService";
import { ThreeDayMenuResponseDto } from "../../meal-plan-template/dtos/MealPlanTemplate";
import { DailyMenuResponseDto, GetThreeDayMenuDto, CreateDailyMenuDto, UpdateDailyMenuDto, ActiveOrDeactivateResponse } from "../dtos/DailyMenuDtos";
import { TOKENS } from "@/helper/menu/token";
import { DailyMenuRepository } from "../repository/Daily_Menu.Repository";
import { BadRequestError, InternalServerError, NotFoundError } from "@/globalError/AppError";
import { DailyMenuMapper } from "../mapper/Daily_Menu.Mapper";


@injectable()
export class DailyMenuService implements IDailyMenuService {
    constructor(@inject(TOKENS.DailyMenuRepository) private dailyMenuRepo:DailyMenuRepository){}
  
    async getById(id: string): Promise<DailyMenuResponseDto> {
          if(!id){
              throw new BadRequestError("ID is required"); 
          }
        
          const dailyMenu = await this.dailyMenuRepo.findById(id);
          if(!dailyMenu){
              throw new NotFoundError("Menu not found"); 
          }
          return DailyMenuMapper.rowToResponseDto(dailyMenu)

    }

    getThreeDayMenu(dto: GetThreeDayMenuDto): Promise<ThreeDayMenuResponseDto[]> {
        //    if(!dto || !dto.start_date){
        //         throw new BadRequestError("Start date is required");
        //    }
        //       // Validate date format (YYYY-MM-DD)
        //       if(!/^\d{4}-\d{2}-\d{2}$/.test(dto.start_date.toISOString())){
        //         throw new BadRequestError("Invalid date format. Expected YYYY-MM-DD");
        //         };   
        throw new Error("Method not implemented.");        

    }
    
    async create(dto: CreateDailyMenuDto, adminId: string): Promise<DailyMenuResponseDto> {
            if(!dto || !adminId){
                throw new BadRequestError("Missing required fields: menu_date, slot, item_ids");
            }

            const  createdMenu = await this.dailyMenuRepo.create(dto, adminId);
            if(!createdMenu){
                throw new InternalServerError("Failed to create menu");
            }

            return DailyMenuMapper.rowToResponseDto(createdMenu);
    }

    async update(id: string, dto: UpdateDailyMenuDto, adminId: string): Promise<DailyMenuResponseDto> {
           if(!id){
                throw new BadRequestError("Missing required fields: id, menu_date, slot, item_ids");
            }

             const existingMenu = await this.dailyMenuRepo.findById(id);
             if(!existingMenu?.id){
                throw new NotFoundError("Menu not found");
             }
            
            if(existingMenu.is_active===false){
                throw new BadRequestError("Cannot update an inactive menu. Please activate it first.");
            }
             
            const updateDailyMenu = await this.dailyMenuRepo.update(id,dto, adminId);
            if(!updateDailyMenu){
                throw new NotFoundError("Menu not found");
            }
            return DailyMenuMapper.rowToResponseDto(updateDailyMenu);
    }

    async deactivate(id: string, userId: string): Promise<ActiveOrDeactivateResponse> {
         if(!id){
               throw new BadRequestError("ID is required");
         }
         const deactivatedMenu = await this.dailyMenuRepo.deactivate(id, userId);
         if(!deactivatedMenu){
             throw new InternalServerError("Failed to deactivate menu");
         }
         return {id, is_active: false};  
    }

     async activate(id: string, userId: string): Promise<ActiveOrDeactivateResponse> {
          if(!id){
               throw new BadRequestError("ID is required");
         }
         const deactivatedMenu = await this.dailyMenuRepo.deactivate(id, userId);
         if(!deactivatedMenu){
             throw new InternalServerError("Failed to deactivate menu");
         }
         return {id, is_active: true}; 
    }

    async deleteDailyMenu(id: string): Promise<void> {
         if(!id){
               throw new BadRequestError("ID is required");
         }

         await this.dailyMenuRepo.delete(id);
            
    }

}