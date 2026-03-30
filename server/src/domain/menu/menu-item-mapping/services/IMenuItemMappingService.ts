import { CreateMenuItemMappingDto, MenuItemMappingResponseDto, UpdateMenuItemMappingDto } from "../dtos/menu-item-mapping";

export interface IMenuItemMappingService {

    createMenuItemMapping(dto: CreateMenuItemMappingDto): Promise<MenuItemMappingResponseDto>;

    findById(id: string): Promise<MenuItemMappingResponseDto | null>;

    updateMenuItemMapping(id: string, dto: UpdateMenuItemMappingDto): Promise<MenuItemMappingResponseDto | null>;

     deleteMenuItemMapping(id: string): Promise<number>;

     findAllMenuItemMappings(): Promise<MenuItemMappingResponseDto[]>;
}