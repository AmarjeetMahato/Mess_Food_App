import { inject, injectable } from "tsyringe";
import { IMenuItemMappingService } from "./IMenuItemMappingService";
import { CreateMenuItemMappingDto, MenuItemMappingResponseDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";
import { TOKENS } from "@/helper/menu/token";
import type { IMenuItemMappingRepository } from "../repository/IMenuItemMappingRepository";
import { MenuItemMappingEntity } from "../entity/menuItemMappingEntity";
import { MenuItemMappingMapper } from "../mapper/menuItemMappingMapper";
import { BadRequestError, NotFoundError } from "@/globalError/AppError";


@injectable()
export class MenuItemMappingService implements IMenuItemMappingService{
    constructor(@inject(TOKENS.MenuItemMappingRepository) private menuItemMappingRepository: IMenuItemMappingRepository){}

    async createMenuItemMapping(dto: CreateMenuItemMappingDto): Promise<MenuItemMappingResponseDto> {
    
         const row = await this.menuItemMappingRepository.createMenuItemMapping(dto);
         if(!row?.id){
             throw new Error("Failed to create menu item mapping");
         }
         
         const entity = MenuItemMappingMapper.toEntity(row);
         return MenuItemMappingMapper.toResponseDto(entity);
    }


    async findById(id: string): Promise<MenuItemMappingResponseDto | null> {
        if(!id){
            throw new Error("ID must be provided");
        }
        const row = await this.menuItemMappingRepository.findById(id);
        if (!row?.id) {
             throw new NotFoundError("Menu item mapping not found");
        }
        const entity = MenuItemMappingMapper.toEntity(row);
        return MenuItemMappingMapper.toResponseDto(entity);
    }

    async updateMenuItemMapping(id: string, dto: UpdateMenuItemMappingDto): Promise<MenuItemMappingResponseDto | null> {
         if(!id){
             throw new BadRequestError("ID must be provided");
         }

         const existing = this.menuItemMappingRepository.findById(id);
         if(!existing){
             throw new NotFoundError("Menu item mapping not found");
         }
        
         const updatedRow = await this.menuItemMappingRepository.update(id, dto);
         if(!updatedRow){
             throw new Error("Failed to update menu item mapping");
         }
         const entity = MenuItemMappingMapper.toEntity(updatedRow);
         return MenuItemMappingMapper.toResponseDto(entity);
    }
    
    async deleteMenuItemMapping(id: string): Promise<number> {
         if(!id){
                throw new BadRequestError("ID must be provided");
         }
         const deleteCount =  await this.menuItemMappingRepository.delete(id);
         if(deleteCount === 0){
                throw new NotFoundError("Menu item mapping not found");
         }
         if(deleteCount > 1){
                throw new Error("Failed to delete menu item mapping");
         }
         return deleteCount;
    }

    findAllMenuItemMappings(): Promise<MenuItemMappingResponseDto[]> {
        throw new Error("Method not implemented.");
    }
}