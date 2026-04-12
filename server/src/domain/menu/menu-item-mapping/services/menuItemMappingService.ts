import { inject, injectable } from "tsyringe";
import { IMenuItemMappingService } from "./IMenuItemMappingService";
import { CreateMenuItemMappingDto, MenuItemMappingListResponseDto, MenuItemMappingResponseDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";
import { TOKENS } from "@/helper/menu/token";
import type { IMenuItemMappingRepository } from "../repository/IMenuItemMappingRepository";
import { MenuItemMappingMapper } from "../mapper/menuItemMappingMapper";
import { BadRequestError, ConflictError, NotFoundError } from "@/globalError/AppError";
import type { IDailyMenuService } from "../../daily-menu/services/IDailyService";
import type { IMenuItemService } from "../../menu-item/services/IMenu_Item.Service";


@injectable()
export class MenuItemMappingService implements IMenuItemMappingService{
    constructor(
        @inject(TOKENS.MenuItemMappingRepository) private readonly menuItemMappingRepository: IMenuItemMappingRepository,
        @inject(TOKENS.DailyMenuService) private readonly dailyMenuService: IDailyMenuService,
        @inject(TOKENS.MenuItemService) private readonly menuItemService: IMenuItemService
    ){}

    async createMenuItemMapping(dto: CreateMenuItemMappingDto): Promise<MenuItemMappingResponseDto> {
         if(!dto){
               throw new BadRequestError("Invalid input")
         }

          if (!dto.daily_menu_id || !dto.menu_item_id) {
                throw new BadRequestError("daily_menu_id and menu_item_id are required");
        }
        
          // ─── Check Daily Menu ─────────────────────
        await this.dailyMenuService.getById(dto.daily_menu_id);

          // ─── Check Menu Item ──────────────────────
        await this.menuItemService.getById(dto.menu_item_id);

        const existing = await this.menuItemMappingRepository.findByMenuAndItem(
               dto.daily_menu_id, dto.menu_item_id
        )

         if (existing) {
                     throw new ConflictError("Menu item already mapped to this daily menu");
             }

         const createEntity = MenuItemMappingMapper.toCreateEntity(dto);
         const row = await this.menuItemMappingRepository.createMenuItemMapping(createEntity);
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

         const existing = await this.menuItemMappingRepository.findById(id);
         if(!existing){
             throw new NotFoundError("Menu item mapping not found");
         }

         if(dto.daily_menu_id){
                await this.dailyMenuService.getById(dto.daily_menu_id);
         }

         if(dto.menu_item_id){
             await this.menuItemService.getById(dto.menu_item_id);
         }
         const entity = MenuItemMappingMapper.toEntity(existing);
         MenuItemMappingMapper.applyUpdate(entity, dto);
         const updatedRow = await this.menuItemMappingRepository.update(id, entity);
         if(!updatedRow){
             throw new Error("Failed to update menu item mapping");
         }
         const updatedEntity = MenuItemMappingMapper.toEntity(updatedRow);
         return MenuItemMappingMapper.toResponseDto(updatedEntity);
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

    async findAllMenuItemMappings(limit:number, page:number): Promise<MenuItemMappingListResponseDto> {
         const { rows, total } = await this.menuItemMappingRepository.findAll(limit, page);
     const entities = MenuItemMappingMapper.toEntityArray(rows);
    return MenuItemMappingMapper.toListResponseDto(entities, total);
    }
}